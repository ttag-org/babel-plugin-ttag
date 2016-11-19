import { applyReference } from './po-helpers';

export const tryFindPoEntry = (nodePath, config, filename) => {
    const { node } = nodePath;
    const extractors = config.getExtractors();
    const extractor = extractors.find((ext) => ext.match(nodePath, config));

    if (!extractor) {
        return;
    }

    let poEntry = extractor.extract(nodePath, config);
    if (filename !== 'unknown') {
        return applyReference(poEntry, node, filename);    
    }
    return poEntry;
    
};
