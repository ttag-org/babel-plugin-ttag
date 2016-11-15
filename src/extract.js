import Rx from 'rxjs/Rx';
import { toArray, readFileStr$, getQuasiStr } from './utils';
import { buildPotData, makePotStr } from './potfile';
import * as babylon from 'babylon';
import * as t from 'babel-types';
import traverse from 'babel-traverse';
import { PO_PRIMITIVES } from './defaults';
const { MSGID, MSGSTR } = PO_PRIMITIVES;
const { Observable } = Rx;

function gettextExtract(node) {
    return {
        [MSGID]: getQuasiStr(node),
        [MSGSTR]: '',
    };
}

function gettextMatch(node) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === 'gt';
}

export function extractPotEntries(fileContent) {
    const ast = babylon.parse(fileContent);
    const potEntries = [];

    traverse(ast, {
        enter({ node }) {
            if (gettextMatch(node)) {
                potEntries.push(gettextExtract(node));
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
