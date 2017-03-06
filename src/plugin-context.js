import { hasDisablingComment, isInDisabledScope, isC3poImport, hasImportSpecifier } from './utils';
import { ALIASES } from './defaults';

const reverseAliases = {};
for (const key of Object.keys(ALIASES)) {
    reverseAliases[ALIASES[key]] = key;
}

function decorateVisitor(visitor, propertyName, decorator) {
    if (!visitor[propertyName]) {
        visitor[propertyName] = decorator;
        return;
    }
    const orig = visitor[propertyName];
    visitor[propertyName] = (...args) => {
        decorator(...args);
        orig(...args);
    }
}

class PluginContext {
    constructor() {
        this.refresh();
        this.getNode = (args) => args;
        this.decorateImportDeclaration = this.decorateImportDeclaration.bind(this);
        this.decorateProgram = this.decorateProgram.bind(this);
    }

    refresh() {
        this.aliases = {};
        this.imports = new Set();
    }

    decorateImportDeclaration(args) {
        const node = this.getNode(args);
        if (isC3poImport(node)) {
            node.specifiers
            .filter(({ local: { name } }) => reverseAliases[name])
            .map((s) => this.imports.add(s.local.name));
        }
        if (isC3poImport(node) && hasImportSpecifier(node)) {
            node.specifiers
            .filter((s) => s.type === 'ImportSpecifier')
            .filter(({ imported: { name } }) => reverseAliases[name])
            .forEach(({ imported, local }) => {
                this.aliases[reverseAliases[imported.name]] = local.name;
                this.imports.add(local.name);
            });
        }
    }

    decorateProgram() {
        this.refresh();
    }

    apply(visitor) {
        decorateVisitor(visitor, 'ImportDeclaration', this.decorateImportDeclaration);
        decorateVisitor(visitor, 'Program', this.decorateProgram);
        return visitor;
    }
}

export default PluginContext;