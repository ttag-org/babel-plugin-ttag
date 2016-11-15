import Rx from 'rxjs/Rx';
import { toArray, readFileStr$ } from './utils';
import { buildPotData, makePotStr, applyReference } from './potfile';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';
import gettext from './extractors/gettext';

const extractors = [gettext];

export const extractPotEntries = (filename) => (fileContent) => {
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
        .map(extractPotEntries(filepath));
}

export function extractFromFiles(filepaths) {
    Rx.Observable.from(toArray(filepaths))
        .flatMap(extractMessages$)
        .map(buildPotData)
        .map(makePotStr)
        .subscribe((output) => console.log(output.toString()));
}
