import * as t from 'babel-types';
import { PO_PRIMITIVES } from '../defaults';
import { dedentStr, template2Msgid, isValidQuasiExpression, ast2Str } from '../utils';
import { getNPlurals } from '../po-helpers';
import { ValidationError } from '../errors';
const NAME = 'ngettext';
const { MSGID, MSGSTR, MSGID_PLURAL } = PO_PRIMITIVES;

function getMsgid(tag, config) {
    return config.isDedent() ? dedentStr(template2Msgid(tag)) : template2Msgid(tag);
}

function validateExpresssions(expressions) {
    expressions.forEach((exp) => {
        if (!isValidQuasiExpression(exp)) {
            throw new ValidationError(`You can not use ${exp.type} '\${${ast2Str(exp)}}' in localized strings`);
        }
    });
}

function validateNPlural(exp) {
    if (!t.isIdentifier(exp) && !t.isNumericLiteral(exp) && !t.isMemberExpression(exp)) {
        throw new ValidationError(`${exp.type} '${ast2Str(exp)}' can not be used as plural argument`);
    }
}

const validate = (path, config) => {
    const { node } = path;
    const msgidTag = node.arguments[0];
    const msgidAlias = config.getAliasFor('msgid');
    if (! t.isTaggedTemplateExpression(msgidTag)) {
        throw new ValidationError(
            `First argument must be tagged template expression. You should use '${msgidAlias}' tag`);
    }
    if (msgidTag.tag.name !== msgidAlias) {
        throw new ValidationError(
            `Expected '${msgidAlias}' for the first argument but not '${msgidTag.tag.name}'`);
    }
    validateExpresssions(msgidTag.quasi.expressions);
    const tags = node.arguments.slice(1, -1);
    tags.forEach(({ expressions }) => validateExpresssions(expressions));
    const nplurals = getNPlurals(config.getHeaders());

    if (tags.length + 1 !== nplurals) {
        throw new ValidationError(`Expected to have ${nplurals} plural forms but have ${tags.length + 1} instead`);
    }

    validateNPlural(node.arguments[node.arguments.length - 1]);
    const msgid = getMsgid(msgidTag, config);
    if (msgid === '') {
        throw new ValidationError('Can not translate empty string');
    }
};

function match({ node }, config) {
    return (t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === config.getAliasFor(NAME) &&
    node.arguments.length > 0);
}

function extract(path, config) {
    const tags = path.node.arguments.slice(0, -1);
    const msgid = getMsgid(tags[0], config);
    const nplurals = getNPlurals(config.getHeaders());
    // TODO: handle case when only 1 plural form
    const msgidPlural = getMsgid({ quasi: tags[1] }, config);
    const translate = {
        [MSGID]: msgid,
        [MSGID_PLURAL]: msgidPlural,
        [MSGSTR]: [],
    };

    for (let i = 0; i < nplurals; i++) {
        translate[MSGSTR][i] = '';
    }

    return translate;
}

export default { match, extract, name: NAME, validate };
