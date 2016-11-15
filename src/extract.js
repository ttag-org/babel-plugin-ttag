import Rx from 'rxjs/Rx';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';

import { toArray, readFileStr$ } from './utils';
import { buildPotData, makePotStr, applyReference } from './potfile';

import Config from './config';
import gettext from './extractors/gettext';
import ngettext from './extractors/gettext';

const DEFAULT_EXTRACTORS = [gettext, ngettext];

export const extractPotEntries = (filename, extractors) => (fileContent) => {
    const ast = babylon.parse(fileContent);
    const potEntries = [];

    traverse(ast, {
        enter({ node }) {
            const extractor = extractors.find((ext) => ext.match(node));

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

function extractMessages$(filepath) {
    return readFileStr$(filepath)
        .map(extractPotEntries(filepath, DEFAULT_EXTRACTORS));
}

export function extractFromFiles(filepaths, options) {
    const config = new Config(options);
    Rx.Observable.from(toArray(filepaths))
        .flatMap(extractMessages$)
        .map(buildPotData)
        .map(makePotStr)
        .subscribe((output) => console.log(output.toString()));
}
