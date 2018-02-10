import * as bt from 'babel-types';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

import { ALIASES } from './defaults';
import { buildPotData, makePotStr } from './po-helpers';
import { extractPoEntry, getExtractor } from './extract';
import { hasDisablingComment, isInDisabledScope, isC3poImport,
    hasImportSpecifier, poReferenceComparator } from './utils';
import { resolveEntries } from './resolve';
import { ValidationError } from './errors';
import C3poContext from './context';
import { isContextTagCall, isValidTagContext, isContextFnCall,
    isValidFnCallContext } from './gettext-context';


const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

export default function () {
    let context;
    let disabledScopes = new Set();
    const potEntries = [];

    function tryMatchTag(cb) {
        return (nodePath, state) => {
            const node = nodePath.node;
            if (isContextTagCall(node, context) && isValidTagContext(nodePath)) {
                nodePath._C3PO_GETTEXT_CONTEXT = node.tag.object.arguments[0].value;
                nodePath.node = bt.taggedTemplateExpression(node.tag.property, node.quasi);
                nodePath.node.loc = node.loc;
            }
            cb(nodePath, state);
        };
    }

    function tryMatchCall(cb) {
        return (nodePath, state) => {
            const node = nodePath.node;
            if (isContextFnCall(node, context) && isValidFnCallContext(nodePath)) {
                nodePath._C3PO_GETTEXT_CONTEXT = node.callee.object.arguments[0].value;
                nodePath.node = bt.callExpression(node.callee.property, node.arguments);
                nodePath.node.loc = node.loc;
            }
            cb(nodePath, state);
        };
    }

    function extractOrResolve(nodePath, state) {
        if (nodePath.node._C3PO_visited) { // Should visit each node only once
            return;
        }
        if (isInDisabledScope(nodePath, disabledScopes)) {
            return;
        }

        const extractor = getExtractor(nodePath, context);
        if (!extractor) {
            return;
        }

        const alias = context.getAliasFor(extractor.name);
        if (!context.hasImport(alias)
            // can be used in scope of context without import
            && !nodePath._C3PO_GETTEXT_CONTEXT) {
            return;
        }

        try {
            try {
                extractor.validate(nodePath.node, context);
            } catch (err) {
                if (err instanceof ValidationError) {
                    context.validationFailureAction(extractor.name, err.message);
                    return;
                }
                throw err;
            }

            if (context.isExtractMode()) {
                const poEntry = extractPoEntry(extractor, nodePath, context, state);
                poEntry && potEntries.push(poEntry);
            }

            if (context.isResolveMode()) {
                resolveEntries(extractor, nodePath, context, state);
            }
            nodePath.node._C3PO_visited = true;
        } catch (err) {
            // TODO: handle specific instances of errors
            throw nodePath.buildCodeFrameError(`${err.message}\n${err.stack}`);
        }
    }

    return {
        post() {
            if (context && context.isExtractMode() && potEntries.length) {
                const poData = buildPotData(potEntries);

                // Here we sort reference entries, this could be useful
                // with conf. options extract.location: 'file' and sortByMsgid
                // which simplifies merge of .po files from different
                // branches of SCM such as git or mercurial.
                const ctxs = Object.keys(poData.translations);
                for (const ctx of ctxs) {
                    const poEntries = poData.translations[ctx];
                    Object.keys(poEntries).forEach((k) => {
                        const poEntry = poEntries[k];
                        // poEntry has a form:
                        // {
                        //     msgid: 'message identifier',
                        //     msgstr: 'translation string',
                        //     comments: {
                        //         reference: 'path/to/file.js:line_number\npath/to/other/file.js:line_number'
                        //     }
                        // }
                        if (poEntry.comments && poEntry.comments.reference) {
                            poEntry.comments.reference = poEntry.comments.reference
                                .split('\n')
                                .sort(poReferenceComparator)
                                .join('\n');
                        }
                    });

                    if (context.isSortedByMsgid()) {
                        const oldPoData = poData.translations[ctx];
                        const newContext = {};
                        const keys = Object.keys(oldPoData).sort();
                        keys.forEach((k) => {
                            newContext[k] = oldPoData[k];
                        });
                        poData.translations[ctx] = newContext;
                    }
                }
                const potStr = makePotStr(poData);
                const filepath = context.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression: tryMatchTag(extractOrResolve),
            CallExpression: tryMatchCall(extractOrResolve),
            Program: (nodePath, state) => {
                if (!context) {
                    context = new C3poContext(state.opts);
                } else {
                    context.clear();
                }
                disabledScopes = new Set();
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            },
            BlockStatement: (nodePath) => {
                if (hasDisablingComment(nodePath.node)) {
                    disabledScopes.add(nodePath.scope.uid);
                }
            },
            ImportDeclaration: (nodePath) => {
                const { node } = nodePath;
                if (isC3poImport(node)) {
                    node.specifiers
                    .filter(({ local: { name } }) => reverseAliases[name])
                    .forEach((s) => context.addImport(s.local.name));
                }
                if (isC3poImport(node) && hasImportSpecifier(node)) {
                    node.specifiers
                    .filter(bt.isImportSpecifier)
                    .filter(({ imported: { name } }) => reverseAliases[name])
                    .forEach(({ imported, local }) => {
                        context.addAlias(reverseAliases[imported.name], local.name);
                        context.addImport(local.name);
                    });
                }
            },
        },
    };
}
