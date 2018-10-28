export const DEFAULT_HEADERS = {
    'content-type': 'text/plain; charset=UTF-8',
    'plural-forms': 'nplurals=2; plural=(n!=1);',
};

// TODO: setup default aliases from extractors
export const FUNC_TO_ALIAS_MAP = {
    'tag-gettext': 't',
    'jsxtag-gettext': 'jt',
    gettext: ['gettext', '_'],
    ngettext: 'ngettext',
    msgid: 'msgid',
    context: 'c',
};

export const ALIAS_TO_FUNC_MAP = Object.keys(FUNC_TO_ALIAS_MAP).reduce((obj, key) => {
    const value = FUNC_TO_ALIAS_MAP[key];
    if (Array.isArray(value)) {
        value.forEach((alias) => {
            obj[alias] = key;
        });
    } else {
        obj[value] = key;
    }
    return obj;
}, {});

export const PO_PRIMITIVES = {
    MSGSTR: 'msgstr',
    MSGID: 'msgid',
    MSGCTXT: 'msgctxt',
    MSGID_PLURAL: 'msgid_plural',
};

export const UNRESOLVED_ACTION = {
    FAIL: 'fail',
    WARN: 'warn',
    SKIP: 'skip',
};

export const DISABLE_COMMENT = 'disable ttag';

export const TTAGID = 'ttag';
export const TTAG_MACRO_ID = 'ttag.macro';
export const INTERNAL_TTAG_MACRO_ID = 'babel-plugin-ttag/dist/ttag.macro';

export const DEFAULT_POT_OUTPUT = 'polyglot_result.pot';

export const LOCATION = {
    FULL: 'full',
    FILE: 'file',
    NEVER: 'never',
};
