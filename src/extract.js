import Rx from 'rxjs/Rx';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';

import { toArray, readFileStr$ } from './utils';
import { buildPotData, makePotStr, applyReference } from './potfile';

import Config from './config';

export const extractPotEntries = (locale, filename, config) => (fileContent) => {
    const extractors = config.getExtractors();
    const ast = babylon.parse(fileContent);
    const potEntries = [];

    traverse(ast, {
        enter({ node }) {
            const extractor = extractors.find((ext) => ext.match(node, config));

            if (!extractor) {
                return;
            }

            let poEntry = extractor.extract(node, config, locale);
            poEntry = applyReference(poEntry, node, filename);
            potEntries.push(poEntry);
        },
    });

    return potEntries;
};

const extractMessages$ = (locale, config) => (filepath) => {
    return readFileStr$(filepath)
        .map(extractPotEntries(locale, filepath, config));
};


const extractForLocale$ = (filepaths, config) => (locale) => {
    return Rx.Observable.from(toArray(filepaths))
        .flatMap(extractMessages$(locale, config))
        .map(buildPotData)
        .map(makePotStr)
};

export function extractFromFiles(filepaths, options) {
    const config = new Config(options);
    const locales = config.getLocales();
    Rx.Observable.from(locales)
        .flatMap(extractForLocale$(filepaths, config))
        .subscribe((output) => console.log(output.toString()));
}
