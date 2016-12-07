import { ALIASES, DEFAULT_POT_OUTPUT, DEFAULT_HEADERS,
    UNRESOLVED_ACTION } from './defaults';
const { FAIL, WARN, SKIP } = UNRESOLVED_ACTION;
import Ajv from 'ajv';
import gettext from './extractors/tag-gettext';
import ngettext from './extractors/tag-ngettext';
import fnGettext from './extractors/fn-gettext';

const DEFAULT_EXTRACTORS = [gettext, ngettext, fnGettext];

const extractConfigSchema = {
    type: ['object', 'null'],
    properties: {
        output: { type: 'string' },
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

const configSchema = {
    type: 'object',
    properties: {
        extract: extractConfigSchema,
        resolve: resolveConfigSchema,
        locales: localesSchema,
    },
    additionalProperties: false,
};

class ConfigValidationError extends Error {}
class ConfigError extends Error {}

function validateConfig(config, schema) {
    const ajv = new Ajv({ allErrors: true, verbose: true, v5: true });
    const isValid = ajv.validate(schema, config);
    return [isValid, ajv.errorsText(), ajv.errors];
}

class Config {
    constructor(config = {}) {
        this.config = config;
        const [validationResult, errorsText] = validateConfig(this.config, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
    }

    getAliasFor(funcName) {
        // TODO: implement possibility to overwrite or add aliases in config;
        const alias = ALIASES[funcName];
        if (!alias) {
            throw new ConfigError(`Alias for function ${funcName} was not found ${JSON.stringify(ALIASES)}`);
        }
        return alias;
    }

    getExtractors() {
        // TODO: implement possibility to specify additional extractors in config;
        return DEFAULT_EXTRACTORS;
    }

    getHeaders() {
        return (this.config.extract && this.config.extract.headers) || DEFAULT_HEADERS;
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

    noTranslationOnResolve(message) {
        /* eslint-disable no-console */
        if (! this.isResolveMode()) {
            return;
        }
        const mode = this.config.resolve.unresolved || SKIP;
        switch (mode) {
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
}

export default Config;
