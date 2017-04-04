import { ALIASES, DEFAULT_POT_OUTPUT, DEFAULT_HEADERS,
    UNRESOLVED_ACTION, LOCATION } from './defaults';
const { FAIL, WARN, SKIP } = UNRESOLVED_ACTION;
import tagGettext from './extractors/tag-gettext';
import jsxtagGettext from './extractors/jsxtag-gettext';
import tagNgettext from './extractors/tag-ngettext';
import gettext from './extractors/gettext';
import ngettext from './extractors/ngettext';
import { parsePoData, getDefaultPoData } from './po-helpers';
import { ConfigValidationError, ConfigError } from './errors';
import { validateConfig, configSchema } from './config';

const DEFAULT_EXTRACTORS = [tagGettext, jsxtagGettext, tagNgettext, gettext, ngettext];

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
    constructor(config = {}) {
        this.config = config;
        const [validationResult, errorsText] = validateConfig(this.config, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
        this.aliases = {};
        this.imports = new Set();
        if (this.config.defaultHeaders && typeof this.config.defaultHeaders === 'string') {
            const { headers } = parsePoData(this.config.defaultHeaders);
            this.config.defaultHeaders = headers;
        }
        this.setPoData();
        Object.freeze(this.config);
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

    setImports(imports) {
        this.imports = imports;
    }

    hasImport(alias) {
        const isInDiscover = this.config.discover && this.config.discover.indexOf(alias) !== -1;
        return this.imports.has(alias) || isInDiscover;
    }

    getExtractors() {
        // TODO: implement possibility to specify additional extractors in config;
        return DEFAULT_EXTRACTORS;
    }

    getHeaders() {
        return (this.poData && this.poData.headers) || this.config.defaultHeaders || DEFAULT_HEADERS;
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
        if (!poFilePath) {
            this.poData = getDefaultPoData(this.getHeaders());
            return;
        }
        this.poData = poFilePath === 'default' ? getDefaultPoData(this.getHeaders()) : parsePoData(poFilePath);
    }

    getTranslations() {
        return this.poData.translations;
    }

}

export default C3poContext;
