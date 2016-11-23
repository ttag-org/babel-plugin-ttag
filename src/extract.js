import { applyReference } from './po-helpers';

export function getExtractor(nodePath, config) {
    const extractors = config.getExtractors();
    return extractors.find((ext) => ext.match(nodePath, config));
}

export const extractPoEntry = (extractor, nodePath, config, state) => {
    const { node } = nodePath;
    const filename = state.file.opts.filename;
    const poEntry = extractor.extract(nodePath, config);

    if (filename !== 'unknown') {
        return applyReference(poEntry, node, filename);
    }
    return poEntry;
};
