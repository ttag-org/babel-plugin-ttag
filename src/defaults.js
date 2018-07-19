export const DEFAULT_HEADERS = {
    'content-type': 'text/plain; charset=UTF-8',
    'plural-forms': 'nplurals=2; plural=(n!=1);',
};

// TODO: setup default aliases from extractors
export const ALIASES = {
    'tag-gettext': 't',
    'jsxtag-gettext': 'jt',
    gettext: 'gettext',
    ngettext: 'ngettext',
    msgid: 'msgid',
    context: 'c',
};

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

export const DEFAULT_POT_OUTPUT = 'polyglot_result.pot';

export const LOCATION = {
    FULL: 'full',
    FILE: 'file',
    NEVER: 'never',
};
