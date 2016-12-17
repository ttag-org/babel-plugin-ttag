import { applyReference } from './po-helpers';
import path from 'path';
import { ValidationError } from './errors';

export function getExtractor(nodePath, config) {
    const extractors = config.getExtractors();
    return extractors.find((ext) => ext.match(nodePath, config));
}

export const extractPoEntry = (extractor, nodePath, config, state) => {
    try {
        extractor.validate(nodePath, config);
    } catch (err) {
        if (err instanceof ValidationError) {
            config.validationFailureAction(extractor.name, err.message);
            return null;
        }
        throw err;
    }
    const { node } = nodePath;
    const filename = state.file.opts.filename;
    const poEntry = extractor.extract(nodePath, config);
    const location = config.getLocation();

    if (filename !== 'unknown') {
        const base = `${process.cwd()}${path.sep}`;
        return applyReference(poEntry, node, filename.replace(base, ''), location);
    }

    return poEntry;
};
