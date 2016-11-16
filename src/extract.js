import path from 'path';
import * as fs from 'fs';
import mkdirp from 'mkdirp';
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

            let poEntry = extractor.extract(node, config);
            poEntry = applyReference(poEntry, node, filename);
            potEntries.push(poEntry);
        },
    });

    return potEntries;
};

const extractMessages$ = (config) => (filepath) => (
    readFileStr$(filepath).map(extractPotEntries(filepath, config))
);

function saveToFile(output, config) {
    const potStr = output.toString();
    const filepath = config.getOutputFilepath();
    const dirPath = path.dirname(filepath);
    mkdirp.sync(dirPath);
    fs.writeFileSync(filepath, potStr);
    // eslint-disable-next-line
    console.log(`Polyglot > File is ready '${filepath}'`);
}

export function extractFromFiles(filepaths, options) {
    const config = new Config(options);
    Rx.Observable.from(toArray(filepaths))
        .flatMap(extractMessages$(config))
        .map(buildPotData)
        .map(makePotStr)
        .subscribe((output) => {
            if (options.interactive) {
                process.stdout.write(output);
            } else {
                saveToFile(output, config);
            }
        });
}
