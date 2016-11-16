import Rx from 'rxjs/Rx';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';

import { toArray, readFileStr$ } from './utils';
import { buildPotData, makePotStr, applyReference } from './potfile';

import Config from './config';

export const extractPotEntries = (filename, config) => (fileContent) => {
    const extractors = config.getExtractors();
    const ast = babylon.parse(fileContent);
    const potEntries = [];

    traverse(ast, {
        enter({ node }) {
            const extractor = extractors.find((ext) => ext.match(node, config));

            if (!extractor) {
                return;
            }

            let poEntry = extractor.extract(node);
            poEntry = applyReference(poEntry, node, filename);
            potEntries.push(poEntry);
        },
    });

    return potEntries;
};

const extractMessages$ = (config) => (filepath) => {
    return readFileStr$(filepath)
        .map(extractPotEntries(filepath, config));
};

export function extractFromFiles(filepaths, options) {
    const config = new Config(options);
    Rx.Observable.from(toArray(filepaths))
        .flatMap(extractMessages$(config))
        .map(buildPotData)
        .map(makePotStr)
        .subscribe((output) => console.log(output.toString()));
}
