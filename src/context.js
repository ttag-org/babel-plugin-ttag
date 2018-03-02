import { ALIASES, DEFAULT_POT_OUTPUT, DEFAULT_HEADERS,
    UNRESOLVED_ACTION, LOCATION } from './defaults';
const { FAIL, WARN, SKIP } = UNRESOLVED_ACTION;
import tagGettext from './extractors/tag-gettext';
import jsxtagGettext from './extractors/jsxtag-gettext';
import gettext from './extractors/gettext';
import ngettext from './extractors/ngettext';
import { parsePoData, getDefaultPoData, getNPlurals, getPluralFunc } from './po-helpers';
import { ConfigValidationError, ConfigError } from './errors';
import { validateConfig, configSchema } from './config';
import { getNPlurals as getPluralsNumForLang, getPluralFormsHeader, getFormula } from 'plural-forms';

const DEFAULT_EXTRACTORS = [tagGettext, jsxtagGettext, gettext, ngettext];

function logAction(message, level = SKIP) {
    /* eslint-disable no-console */
    switch (level) {
        case FAIL:
            throw new Error(message);
        case SKIP:
            break;
        case WARN:
            // TODO: use logger that can log to console or file or stdout
            console.warn(message);
            break;
        default:
            // TODO: use logger that can log to console or file or stdout
            console.warn(message);
    }
}

class C3poContext {
    constructor(config) {
        this.config = config || {};
        const [validationResult, errorsText] = validateConfig(this.config, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
        this.clear();
        if (!this.config.defaultLang) {
            this.config.defaultLang = 'en';
        }
        this.setPoData();
        Object.freeze(this.config);
    }

    clear() {
        this.aliases = {};
        this.imports = new Set();
    }

    getAliasFor(funcName) {
        // TODO: implement possibility to overwrite or add aliases in config;
        const defaultAlias = ALIASES[funcName];
        const alias = this.aliases[funcName] || defaultAlias;
        if (!alias) {
            throw new ConfigError(`Alias for function ${funcName} was not found ${JSON.stringify(ALIASES)}`);
        }
        return alias;
    }

    setAliases(aliases) {
        this.aliases = aliases;
    }

    addAlias(funcName, alias) {
        this.aliases[funcName] = alias;
    }

    setImports(imports) {
        this.imports = imports;
    }

    hasImport(alias) {
        const isInDiscover = this.config.discover && this.config.discover.indexOf(alias) !== -1;
        return this.imports.has(alias) || isInDiscover;
    }

    addImport(importName) {
        this.imports.add(importName);
    }

    getExtractors() {
        // TODO: implement possibility to specify additional extractors in config;
        return DEFAULT_EXTRACTORS;
    }

    // getHeaders() {
    //     return (this.poData && this.poData.headers) || this.config.defaultHeaders || DEFAULT_HEADERS;
    // }

    getDefaultHeaders() {
        const headers = { ...DEFAULT_HEADERS };
        headers['plural-forms'] = getPluralFormsHeader(this.config.defaultLang);
        return headers;
    }

    getPluralsCount() {
        if (this.poData && this.poData.headers) {
            return getNPlurals(this.poData.headers);
        }
        return getPluralsNumForLang(this.config.defaultLang);
    }

    getPluralFormula() {
        if (this.poData && this.poData.headers) {
            return getPluralFunc(this.poData.headers);
        }
        return getFormula(this.config.defaultLang);
    }

    getLocation() {
        return (this.config.extract && this.config.extract.location) || LOCATION.FULL;
    }

    getOutputFilepath() {
        return (this.config.extract && this.config.extract.output) || DEFAULT_POT_OUTPUT;
    }

    getPoFilePath() {
        return this.config.resolve && this.config.resolve.translations;
    }

    isExtractMode() {
        return Boolean(this.config.extract);
    }

    isNumberedExpressions() {
        return Boolean(this.config.numberedExpressions);
    }

    isResolveMode() {
        return Boolean(this.config.resolve);
    }

    noTranslationAction(message) {
        if (! this.isResolveMode()) {
            return;
        }
        logAction(message, this.config.resolve.unresolved);
    }

    validationFailureAction(funcName, message) {
        const level = (
            this.config.extractors &&
            this.config.extractors[funcName] &&
            this.config.extractors[funcName].invalidFormat) || FAIL;
        logAction(message, level);
    }

    isDedent() {
        if (this.config.dedent === undefined) {
            return true;
        }
        return this.config.dedent;
    }

    devCommentsEnabled() {
        return Boolean(this.config.addComments);
    }

    getAddComments() {
        return this.config.addComments;
    }

    isSortedByMsgid() {
        return Boolean(this.config.sortByMsgid);
    }

    setPoData() {
        const poFilePath = this.getPoFilePath();
        if (!poFilePath || poFilePath === 'default') {
            this.poData = getDefaultPoData(this.getDefaultHeaders());
            return;
        }
        this.poData = parsePoData(poFilePath);
    }

    getTranslations(gettextContext = '') {
        return this.poData.translations[gettextContext];
    }

}

export default C3poContext;
