import { NoTranslationError } from './errors';
import { dedentStr } from './utils';
import { hasTranslations, isFuzzy } from './po-helpers';

export function resolveEntries(extractor, nodePath, context, state) {
    try {
        const translations = context.getTranslations();
        const msgid = context.isDedent() ? dedentStr(extractor.getMsgid(nodePath.node)) :
            extractor.getMsgid(nodePath.node);
        const translationObj = translations[msgid];

        if (!translationObj) {
            throw new NoTranslationError(`No "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        if (!hasTranslations(translationObj) || isFuzzy(translationObj)) {
            throw new NoTranslationError(`No translation for "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        const resultNode = extractor.resolve(nodePath.node, translationObj, context, state);
        if (resultNode !== undefined) {
            nodePath.replaceWith(resultNode);
        }
    } catch (err) {
        if (err instanceof NoTranslationError) {
            context.noTranslationAction(err.message);
            if (extractor.resolveDefault) {
                const resultNode = extractor.resolveDefault(nodePath.node, context, state);
                if (resultNode !== undefined) {
                    nodePath.replaceWith(resultNode);
                }
            }
            return;
        }
        throw err;
    }
}
