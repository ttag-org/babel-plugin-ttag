import Rx from 'rxjs/Rx';
import { toArray, readFileStr$ } from './utils';
import { buildPotData, makePotStr } from './potfile';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';
import gettext from './extractors/gettext';
const { Observable } = Rx;

const extractors = [gettext];

export function extractPotEntries(fileContent) {
    const ast = babylon.parse(fileContent);
    const potEntries = [];

    traverse(ast, {
        enter({ node }) {
            const extractor = extractors.find((ext) => ext.match(node));
            if (extractor) {
                potEntries.push(extractor.extract(node));
            }
        },
    });

    return potEntries;
}

function extractMessages$(filepath) {
    return readFileStr$(filepath)
        .map(extractPotEntries);
}

export function extractFromFiles(filepaths) {
    Observable.from(toArray(filepaths))
        .flatMap(extractMessages$)
        .map(buildPotData)
        .map(makePotStr)
        .subscribe((output) => console.log(output.toString()));
}
