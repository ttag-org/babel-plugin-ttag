import fs from 'fs';
import { DEFAULT_CONFIG_PATH } from './defaults';
import ajv from 'ajv';

function validateConfig(config, schema) {

}

class Config {
    constructor({config}) {
        console.log(config);
    }
}

export default Config;