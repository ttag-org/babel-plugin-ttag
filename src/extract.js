import path from 'path';
import { applyReference, applyExtractedComments, applyFormat } from './po-helpers';
import { dedentStr } from './utils';

import { PO_PRIMITIVES } from './defaults';

const { MSGID, MSGSTR, MSGCTXT } = PO_PRIMITIVES;

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
    const { node } = nodePath;
    const { filename } = state.file.opts;
    let poEntry;

    if (extractor.extract) {
        poEntry = extractor.extract(nodePath.node, context);
    } else {
        const msgid = context.isDedent()
            ? dedentStr(extractor.getMsgid(nodePath.node, context))
            : extractor.getMsgid(nodePath.node, context);
        poEntry = defaultExtract(msgid);
    }

    if (nodePath._C3PO_GETTEXT_CONTEXT) {
        poEntry[MSGCTXT] = nodePath._C3PO_GETTEXT_CONTEXT;
    }

    const location = context.getLocation();

    if (filename && filename !== 'unknown') {
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
    applyFormat(poEntry);
    return poEntry;
};
