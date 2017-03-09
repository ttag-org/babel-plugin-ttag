import { NoTranslationError, ValidationError } from './errors';
import { dedentStr } from './utils';
import { hasTranslations } from './po-helpers';

export function resolveEntries(extractor, nodePath, context, state) {
    try {
        extractor.validate(nodePath.node, context);
    } catch (err) {
        if (err instanceof ValidationError) {
            context.validationFailureAction(extractor.name, err.message);
            return;
        }
        throw err;
    }

    try {
        const translations = context.getTranslations();
        const msgid = context.isDedent() ? dedentStr(extractor.getMsgid(nodePath.node)) :
            extractor.getMsgid(nodePath.node);
        const translationObj = translations[msgid];

        if (!translationObj) {
            throw new NoTranslationError(`No "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        if (!hasTranslations(translationObj)) {
            throw new NoTranslationError(`No translation for "${msgid}" in "${context.getPoFilePath()}" file`);
        }

        extractor.resolve(nodePath, translationObj, context, state);
    } catch (err) {
        if (err instanceof NoTranslationError) {
            context.noTranslationAction(err.message);
            extractor.resolveDefault && extractor.resolveDefault(nodePath, context, state);
            return;
        }
        throw err;
    }
}
