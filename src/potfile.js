import gettextParser from 'gettext-parser';
import { DEFAULT_HEADERS } from './defaults';

export function buildPotData(translations) {
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

export function makePotStr(data) {
    return gettextParser.po.compile(data);
}
