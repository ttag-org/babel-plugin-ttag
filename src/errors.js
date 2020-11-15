export class ConfigValidationError extends Error {}
export class ConfigError extends Error {}

export function ValidationError(message) {
    this.name = 'ValidationError';
    this.message = message;
    this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export function NoTranslationError(message) {
    this.name = 'NoTranslationError';
    this.message = message;
    this.stack = (new Error()).stack;
}

NoTranslationError.prototype = Object.create(Error.prototype);
NoTranslationError.prototype.constructor = NoTranslationError;

export function NoExpressionError(message) {
    this.name = 'NoExpressionError';
    this.message = message;
    this.stack = (new Error()).stack;
}
NoExpressionError.prototype = Object.create(Error.prototype);
NoExpressionError.prototype.constructor = NoExpressionError;
