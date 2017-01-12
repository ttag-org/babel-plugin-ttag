import { NoTranslationError, ValidationError } from './errors';

export function resolveEntries(extractor, nodePath, poData, config, state) {
    try {
        extractor.validate(nodePath, config);
    } catch (err) {
        if (err instanceof ValidationError) {
            config.validationFailureAction(extractor.name, err.message);
            return;
        }
        throw err;
    }

    try {
        extractor.resolve(nodePath, poData, config, state);
    } catch (err) {
        if (err instanceof NoTranslationError) {
            config.noTranslationAction(err.message);
            extractor.resolveDefault && extractor.resolveDefault(nodePath, poData, config, state);
            return;
        }
        throw err;
    }
}
