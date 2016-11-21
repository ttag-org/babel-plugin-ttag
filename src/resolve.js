import { getQuasiStr, strToQuasi, hasExpressions } from './utils';
import * as t from 'babel-types';
import { PO_PRIMITIVES } from './defaults';
const { MSGSTR } = PO_PRIMITIVES;

export function stripPolyglotTags(nodePath) {
    const { node } = nodePath;
    const transStr = getQuasiStr(node);

    if (hasExpressions(node)) {
        nodePath.replaceWithSourceString(strToQuasi(transStr));
    } else {
        nodePath.replaceWith(t.stringLiteral(transStr));
    }
}

function getTranslationObject({ node }, translates) {
    return translates[getQuasiStr(node)];
}


function hasTranslatorTranslations(translationObject) {
    return translationObject[MSGSTR] && translationObject[MSGSTR].every((o) => o.length);
}

export const resolveTranslations = (nodePath, config, translations) => {
    const transObject = getTranslationObject(nodePath, translations);
    const hasTranslations = transObject && hasTranslatorTranslations(transObject);
    const extractors = config.getExtractors();
    const extractor = extractors.find((ext) => ext.match(nodePath, config));
    if (extractor) {
        if (hasTranslations) {
            extractor.resolve(nodePath, transObject, config);
        } else {
            stripPolyglotTags(nodePath);
        }
    }
};
