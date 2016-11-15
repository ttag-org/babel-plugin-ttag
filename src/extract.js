import * as babylon from 'babylon';
import * as t from 'babel-types';
import traverse from 'babel-traverse';
import fs from 'fs';
import generate from 'babel-generator';
import gettextParser from 'gettext-parser';
import Rx from 'rxjs/Rx';
import { PO_PRIMITIVES, DEFAULT_HEADERS } from './defaults';
const { Observable } = Rx;
const { MSGID, MSGSTR } = PO_PRIMITIVES;

const readFile$ = Observable.bindNodeCallback(fs.readFile);

function quasiStr(node) {
    return generate(node.quasi).code.replace(/^`|`$/g, '');
}

function gettextExtract(node) {
    return {
        [MSGID]: quasiStr(node),
        [MSGSTR]: '',
    };
}

function gettextMatch(node) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === 'gt';
}

function extractPotEntries(fileContent) {
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

function toArray(args) {
    return Array.isArray(args) ? args : [args];
}

function extractMessages$(filepath) {
    return readFile$(filepath)
        .map((data) => data.toString())
        .map(extractPotEntries);
}

function buildPot(translations) {
    const data = {
        charset: 'UTF-8',
        headers: DEFAULT_HEADERS,
        translations: {
            context: {
            },
        },
    };

    const defaultContext = data.translations.context;

    for (const trans of translations) {
        defaultContext[trans.msgid] = trans;
    }

    return data;
}

function buildPotFile(data) {
    return gettextParser.po.compile(data);
}

export function extractFromFiles(filepaths) {
    Observable.from(toArray(filepaths))
        .flatMap(extractMessages$)
        .map(buildPot)
        .map(buildPotFile)
        .subscribe((output) => console.log(output.toString()));
}
