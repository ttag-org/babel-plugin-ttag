import fs from 'fs';
import { DEFAULT_CONFIG_PATH, ALIASES } from './defaults';
import Ajv from 'ajv';
import gettext from './extractors/gettext';
import ngettext from './extractors/ngettext';

const DEFAULT_EXTRACTORS = [gettext, ngettext];

const localesSchema = {
    additionalProperties: {
        properties: {
            headers: {
                properties: {
                    'content-type': { type: 'string' },
                    'plural-forms': { type: 'string' },
                },
                additionalProperties: false,
            },
        },
        required: ['headers'],
        additionalProperties: false,
    },
};

const configSchema = {
    title: 'Polyglot config schema',
    type: 'object',
    properties: {
        locales: { ...localesSchema },
        output: {
            properties: {
                name: { type: 'string' },
            },
            required: ['name'],
            additionalProperties: false,
        },
    },
    required: ['output', 'locales'],
    additionalProperties: false,
};

class ConfigValidationError extends Error {
}

class ConfigError extends Error {
}


function validateConfig(config, schema) {
    const ajv = new Ajv({ allErrors: true, verbose: true, v5: true });
    const isValid = ajv.validate(schema, config);
    return [isValid, ajv.errorsText(), ajv.errors];
}

class Config {
    constructor(options) {
        this.options = options;
        // TODO: handle config validation errors and messages.
        const configStr = fs.readFileSync(options.config || DEFAULT_CONFIG_PATH);
        this.config = JSON.parse(configStr);
        const [validationResult, errorsText] = validateConfig(this.config, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
    }

    getAliasFor(funcName) {
        // TODO: implement possibility to overwrite or add aliases in config;
        const aliases = ALIASES;
        for (const k of Object.keys(aliases)) {
            if (aliases[k] === funcName) {
                return k;
            }
        }
        throw new ConfigError(`Alias for function ${funcName} was not found ${JSON.stringify(aliases)}`);
    }

    getExtractors() {
        // TODO: implement possibility to specify additional extractors in config;
        return DEFAULT_EXTRACTORS;
    }

    getNPlurals(locale) {
        const headers = this.config.locales[locale].headers;
        const nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1];
        return nplurals;
    }

    getLocales() {
        return Object.keys(this.config.locales);
    }

    getOptions() {
        return this.options;
    }
}

export default Config;
