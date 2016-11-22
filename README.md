# babel-polyglot-plugin [WIP]
Solution for providing gettext like translations into your project.

Plugin functions:
- extracting translations from es6 tagged templates to .pot 
- resolving translations from .po files right into your sources at compile time.

Key features:
- no additional formatting syntax(no sprintf), only es6 tagged templates.
- works with existing gettext utility (generates .pot files, resolves translations from .po).
- possibility to precompile all translations into the browser bundles (no runtime resolving, all bundles are precompiled).

Installation
============

`npm install babel-polyglot-plugin`


License
=======

[MIT License](LICENSE).
