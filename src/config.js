import { ALIASES, DEFAULT_POT_OUTPUT, DEFAULT_HEADERS,
    UNRESOLVED_ACTION, LOCATION } from './defaults';
const { FAIL, WARN, SKIP } = UNRESOLVED_ACTION;
const { FULL, FILE, NEVER } = LOCATION;
import Ajv from 'ajv';
import gettext from './extractors/tag-gettext';
import ngettext from './extractors/tag-ngettext';
import fnGettext from './extractors/gettext';
import { ConfigValidationError, ConfigError } from './errors';

const DEFAULT_EXTRACTORS = [gettext, ngettext, fnGettext];

const extractConfigSchema = {
    type: ['object', 'null'],
    properties: {
        output: { type: 'string' },
        location: { enum: [FULL, FILE, NEVER] },
        headers: {
            properties: {
                'content-type': { type: 'string' },
                'plural-forms': { type: 'string' },
            },
            additionalProperties: false,
        },
    },
    additionalProperties: false,
};

const resolveConfigSchema = {
    type: ['object', 'null'],
    properties: {
        locale: { type: 'string' },
        unresolved: { enum: [FAIL, WARN, SKIP] },
    },
    required: ['locale'],
    additionalProperties: false,
};

const localesSchema = {
    type: 'object',
    additionalProperties: { type: 'string' },
};

const extractorsSchema = {
    type: 'object',
    additionalProperties: {
        type: 'object',
        properties: {
            invalidFormat: { enum: [FAIL, WARN, SKIP] },
        },
        additionalProperties: false,
    },
};

export const configSchema = {
    type: 'object',
    properties: {
        extract: extractConfigSchema,
        resolve: resolveConfigSchema,
        locales: localesSchema,
        extractors: extractorsSchema,
        dedent: { type: 'boolean' },
    },
    additionalProperties: false,
};

export function validateConfig(config, schema) {
    const ajv = new Ajv({ allErrors: true, verbose: true, v5: true });
    const isValid = ajv.validate(schema, config);
    return [isValid, ajv.errorsText(), ajv.errors];
}

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

// TODO: rename to context.
class Config {
    constructor(config = {}) {
        this.config = config;
        const [validationResult, errorsText] = validateConfig(this.config, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
        this.aliases = {};
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

    getExtractors() {
        // TODO: implement possibility to specify additional extractors in config;
        return DEFAULT_EXTRACTORS;
    }

    getHeaders() {
        return (this.config.extract && this.config.extract.headers) || DEFAULT_HEADERS;
    }

    getLocation() {
        return (this.config.extract && this.config.extract.location) || LOCATION.FULL;
    }

    getOutputFilepath() {
        return (this.config.extract && this.config.extract.output) || DEFAULT_POT_OUTPUT;
    }

    getPoFilePath() {
        // TODO: handle locale is not found;
        const locale = this.config.resolve.locale;
        return this.config.locales[locale];
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
}

export default Config;
