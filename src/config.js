import fs from 'fs';
import { DEFAULT_CONFIG_PATH } from './defaults';
import Ajv from 'ajv';

const localesSchema = {
    additionalProperties: {
        properties: {
            headers: {
                properties: {
                    'content-type': { type: 'string' },
                    'plural-forms': { type: 'string' },
                },
                additionalProperties: false,
            }
        },
        required: ['headers'],
        additionalProperties: false,
    }
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
        }
    },
    required: ['output', 'locales']
};

class ConfigValidationError extends Error {
    constructor(args) {
        super(args);
    }
}


function validateConfig(config, schema) {
    const ajv = new Ajv({ allErrors: true, verbose: true, v5: true });
    const isValid = ajv.validate(schema, config);
    return [isValid, ajv.errorsText(), ajv.errors];
}

class Config {
    constructor({config}) {
        const configStr = fs.readFileSync(config);
        const configObj = JSON.parse(configStr);
        const [validationResult, errorsText] = validateConfig(configObj, configSchema);
        if (!validationResult) {
            throw new ConfigValidationError(errorsText);
        }
    }
}

export default Config;