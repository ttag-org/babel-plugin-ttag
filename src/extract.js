import { applyReference } from './po-helpers';
import path from 'path';

export function getExtractor(nodePath, config) {
    const extractors = config.getExtractors();
    return extractors.find((ext) => ext.match(nodePath, config));
}

export const extractPoEntry = (extractor, nodePath, config, state) => {
    const { node } = nodePath;
    const filename = state.file.opts.filename;
    const poEntry = extractor.extract(nodePath, config);

    if (filename !== 'unknown') {
        const base = `${process.cwd()}${path.sep}`;
        return applyReference(poEntry, node, filename.replace(base, ''));
    }
    return poEntry;
};
