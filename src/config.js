import Ajv from 'ajv';
import { getAvailLangs } from 'plural-forms';
import { UNRESOLVED_ACTION, LOCATION } from './defaults';

const { FAIL, WARN, SKIP } = UNRESOLVED_ACTION;
const { FULL, FILE, NEVER } = LOCATION;

const extractConfigSchema = {
    type: ['object', 'null'],
    properties: {
        output: { type: 'string' },
        location: { enum: [FULL, FILE, NEVER] },
    },
    required: ['output'],
    additionalProperties: false,
};

const resolveConfigSchema = {
    type: ['object', 'null'],
    properties: {
        translations: { type: 'string' },
        unresolved: { enum: [FAIL, WARN, SKIP] },
    },
    required: ['translations'],
    additionalProperties: false,
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
        extractors: extractorsSchema,
        dedent: { type: 'boolean' },
        discover: { type: 'array' },
        defaultLang: { enum: getAvailLangs() },
        addComments: { oneOf: [{ type: 'boolean' }, { type: 'string' }] },
        sortByMsgid: { type: 'boolean' },
        sortByMsgctxt: { type: 'boolean' },
        numberedExpressions: { type: 'boolean' },
    },
    additionalProperties: false,
};

export function validateConfig(config, schema) {
    const ajv = new Ajv({ allErrors: true, verbose: true, v5: true });
    const isValid = ajv.validate(schema, config);
    return [isValid, ajv.errorsText(), ajv.errors];
}
