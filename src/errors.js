export class ConfigValidationError extends Error {}
export class ConfigError extends Error {}

export function ValidationError(message) {
    this.name = 'ValidationError';
    this.message = message || 'Default Message';
    this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
