function makePlaceholder(key) {
    return `[${key}]`;
}
export function fillIn(placeholders, templateStr) {
    for (const key of Object.keys(placeholders)) {
        const value = placeholders[key];
        const placeholder = makePlaceholder(key);
        templateStr = templateStr.replace(placeholder, value);
    }
    return templateStr;
}
