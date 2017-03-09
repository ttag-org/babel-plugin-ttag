import { applyReference, applyExtractedComments } from './po-helpers';
import path from 'path';
import { ValidationError } from './errors';

export function getExtractor(nodePath, context) {
    const extractors = context.getExtractors();
    return extractors.find((ext) => ext.match(nodePath.node, context));
}

export const extractPoEntry = (extractor, nodePath, context, state) => {
    try {
        extractor.validate(nodePath.node, context);
    } catch (err) {
        if (err instanceof ValidationError) {
            context.validationFailureAction(extractor.name, err.message);
            return null;
        }
        throw err;
    }
    const { node } = nodePath;
    const filename = state.file.opts.filename;
    const poEntry = extractor.extract(nodePath.node, context);
    const location = context.getLocation();

    if (filename !== 'unknown') {
        const base = `${process.cwd()}${path.sep}`;
        applyReference(poEntry, node, filename.replace(base, ''), location);
    }

    if (context.devCommentsEnabled()) {
        const maybeTag = context.getAddComments();
        let tag = null;
        if (typeof maybeTag === 'string') {
            tag = maybeTag;
        }
        applyExtractedComments(poEntry, nodePath, tag);
    }

    return poEntry;
};
