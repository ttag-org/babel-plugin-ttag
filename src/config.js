import fs from 'fs';
import { DEFAULT_CONFIG_PATH, ALIASES } from './defaults';
import Ajv from 'ajv';
import gettext from './extractors/gettext';
import ngettext from './extractors/ngettext';

const DEFAULT_EXTRACTORS = [gettext, ngettext];

const configSchema = {
    title: 'Polyglot config schema',
    type: 'object',
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
    required: ['output', 'headers'],
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

    getNPlurals() {
        const headers = this.config.headers;
        const nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1];
        return nplurals;
    }

    getOptions() {
        return this.options;
    }

    getOutputFilepath() {
        return this.config.output;
    }
}

export default Config;
