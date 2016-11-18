import Rx from 'rxjs/Rx';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';
import Config from './config';
import { parserPoTranslations } from './potfile';
import { toArray, readFileStr$, ast2Str } from './utils';

export const resolveForContent = (config, translations) => (fileContent) => {
    const extractors = config.getExtractors();
    const ast = babylon.parse(fileContent);

    traverse(ast, {
        enter(nodePath) {
            const extractor = extractors.find((ext) => ext.match(nodePath, config));
            if (extractor) {
                extractor.resolve(nodePath, translations);
            }
        },
    });

    return ast2Str(ast);
};

const resolveForFile$ = (config, translations) => (filepath) => {
    return readFileStr$(filepath).map(resolveForContent(config, translations));
};

export function resolveForFiles(filepaths, options) {
    const translations = parserPoTranslations(options.pofile);
    const config = new Config(options);
    Rx.Observable.from(toArray(filepaths))
        .flatMap(resolveForFile$(config, translations))
        .subscribe((data) => process.stdout.write(data));
}
