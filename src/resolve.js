export const resolveTranslations = (nodePath, config, translations, state) => {
    const extractors = config.getExtractors();
    const extractor = extractors.find((ext) => ext.match(nodePath, config));
    if (extractor) {
        extractor.resolve(nodePath, translations, config, state);
    }
};

export const resolveDefault = (nodePath, config, state) => {
    const extractors = config.getExtractors();
    const extractor = extractors.find((ext) => ext.match(nodePath, config));
    if (extractor) {
        extractor.resolveDefault && extractor.resolveDefault(nodePath, config, state);
    }
};

