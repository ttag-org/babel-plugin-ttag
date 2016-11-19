export const DEFAULT_HEADERS = {
    'content-type': 'text/plain; charset=UTF-8',
    'plural-forms': 'nplurals=2; plural=(n!=1);',
};

export const ALIASES = {
    gt: 'gettext',
    nt: 'ngettext',
    pt: 'pgettext',
};

export const PO_PRIMITIVES = {
    MSGSTR: 'msgstr',
    MSGID: 'msgid',
    MSGID_PLURAL: 'msgid_plural',
};

export const DEFAULT_POT_OUTPUT = 'polyglot_result.pot';

export const MODE = {
    EXTRACT: 'EXTRACT',
    RESOLVE: 'RESOLVE',
};

export const POLYGLOT_MODE_ENV = 'POLYGLOT_MODE';

export const POLYGLOT_LOCALE_ENV = 'POLYGLOT_LOCALE';
