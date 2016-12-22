import * as t from 'babel-types';
const NAME = 'ngettext';

function match({ node }, config) {
    return (t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === config.getAliasFor(NAME) &&
    node.arguments.length > 0);
}


export default { match, name: NAME };
