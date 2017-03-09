import * as t from 'babel-types';
import gettext from './tag-gettext';

const NAME = 'jsxtag-gettext';

function match(node, context) {
    return t.isTaggedTemplateExpression(node) && node.tag.name === context.getAliasFor(NAME);
}

export default { ...gettext, match, name: NAME };
