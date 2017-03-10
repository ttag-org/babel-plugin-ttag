import { applyReference, applyExtractedComments } from './po-helpers';
import { dedentStr } from './utils';
import path from 'path';

import { PO_PRIMITIVES } from './defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;

import { ValidationError } from './errors';

function defaultExtract(msgid) {
    return {
        [MSGID]: msgid,
        [MSGSTR]: '',
    };
}

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
    let poEntry;

    if (extractor.extract) {
        poEntry = extractor.extract(nodePath.node, context);
    } else {
        const msgid = context.isDedent() ? dedentStr(extractor.getMsgid(nodePath.node)) :
            extractor.getMsgid(nodePath.node);
        poEntry = defaultExtract(msgid);
    }
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
