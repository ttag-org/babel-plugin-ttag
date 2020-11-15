import { NoTranslationError } from './errors';
import { dedentStr } from './utils';
import { hasTranslations, isFuzzy } from './po-helpers';

function replaceNode(nodePath, resultNode) {
    if (resultNode !== undefined) {
        if (nodePath._C3PO_GETTEXT_CONTEXT) {
            nodePath.node = nodePath._ORIGINAL_NODE;
        }
        nodePath.replaceWith(resultNode);
    }
}

export function resolveEntries(extractor, nodePath, context, state) {
    try {
        const gettextContext = nodePath._C3PO_GETTEXT_CONTEXT || '';
        const translations = context.getTranslations(gettextContext);
        const msgid = context.isDedent() ? dedentStr(extractor.getMsgid(nodePath.node, context))
            : extractor.getMsgid(nodePath.node, context);
        const translationObj = translations[msgid];
        if (!translationObj) {
            throw new NoTranslationError(`No "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        if (!hasTranslations(translationObj) || isFuzzy(translationObj)) {
            throw new NoTranslationError(`No translation for "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        const resultNode = extractor.resolve(nodePath.node, translationObj, context, state);
        replaceNode(nodePath, resultNode);
    } catch (err) {
        if (err instanceof NoTranslationError) {
            context.noTranslationAction(err.message);
            if (extractor.resolveDefault) {
                const resultNode = extractor.resolveDefault(nodePath.node, context, state);
                replaceNode(nodePath, resultNode);
            }
            return;
        }
        throw err;
    }
}
