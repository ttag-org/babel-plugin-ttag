export const resolveTranslations = (nodePath, config, translations) => {
    const extractors = config.getExtractors();
    const extractor = extractors.find((ext) => ext.match(nodePath, config));
    if (extractor) {
        extractor.resolve(nodePath, translations);
    }
};
