import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import C3poContext from './context';
import { extractPoEntry, getExtractor } from './extract';
import { resolveEntries } from './resolve';
import { buildPotData, makePotStr, msgidComparator } from './po-helpers';
import { hasDisablingComment, isInDisabledScope, isC3poImport, hasImportSpecifier } from './utils';
import { ALIASES } from './defaults';
import { ValidationError } from './errors';

const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

export default function () {
    let context;
    let disabledScopes = new Set();
    let potEntries = [];
    let aliases = {};
    let imports = new Set();

    function extractOrResolve(nodePath, state) {
        if (isInDisabledScope(nodePath, disabledScopes)) {
            return;
        }

        if (!context) {
            context = new C3poContext(state.opts);
        }
        context.setAliases(aliases);
        context.setImports(imports);

        const extractor = getExtractor(nodePath, context);
        if (!extractor) {
            return;
        }

        const alias = context.getAliasFor(extractor.name);

        if (!context.hasImport(alias)) {
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
        } catch (err) {
            // TODO: handle specific instances of errors
            throw nodePath.buildCodeFrameError(err.message);
        }
    }

    return {
        post() {
            if (context && context.isExtractMode() && potEntries.length) {
                if (context.isSortedByMsgid()) {
                    // TODO: maybe use heap datastructure to avoid sorting on each filesave
                    potEntries = potEntries.sort(msgidComparator);
                }
                const potStr = makePotStr(buildPotData(potEntries));
                const filepath = context.getOutputFilepath();
                const dirPath = path.dirname(filepath);
                mkdirp.sync(dirPath);
                fs.writeFileSync(filepath, potStr);
            }
        },
        visitor: {
            TaggedTemplateExpression: extractOrResolve,
            CallExpression: extractOrResolve,
            Program: (nodePath) => {
                disabledScopes = new Set();
                aliases = {};
                imports = new Set();
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
                    .map((s) => imports.add(s.local.name));
                }
                if (isC3poImport(node) && hasImportSpecifier(node)) {
                    node.specifiers
                    .filter((s) => s.type === 'ImportSpecifier')
                    .filter(({ imported: { name } }) => reverseAliases[name])
                    .forEach(({ imported, local }) => {
                        aliases[reverseAliases[imported.name]] = local.name;
                        imports.add(local.name);
                    });
                }
            },
        },
    };
}
