# babel-plugin-c-3po [WIP]
## project status - POC
Solution for providing gettext like translations into your project. Uses es6 native template syntax.

Plugin functions:
- extracting translations from es6 tagged templates to .pot 
- resolving translations from .po files right into your sources at compile time.

Key features:
- no additional formatting syntax(no sprintf), only es6 tagged templates.
- works with everything that works with babel. (can be used with react and jsx).
- can be integrated with gettext utility (generates .pot files, resolves translations from .po).
- possibility to precompile all translations into the browser bundles (no runtime resolving, all bundles are precompiled).
- support for plurals and contexts.

Here is the demo project (webpack setup). - https://github.com/AlexMost/c-3po-demo

Installation
============

`npm install --save-dev babel-plugin-c-3po && npm install --save c-3po`


Configuration
=============
Here is the configuration object that you can specify in plugin options inside *.babelrc*:

```javascript
{
  // Specifies where to save extracted gettext entries (.pot) file
  // Plugin will be extracting gettext entries if '*extract*' property is present.
  extract: { output: 'dist/translations.pot' }, 
  
  // Specifies Which locale will be resolved currently (must be one of which is stored in 'locales' property)
  // Plugin will be resolving translations from .po file if '*resolve*' property is present.
  resolve: { locale: 'en-us' },
  
  // Map with locales and appropriate .po files with translations.
  locales: {
      'en-us': 'i18n/en.po',
      'ua': 'i18n/ua.po',
  }
}
```

gettext example
===============
Here is how you code will look like while using this plugin:

```javascript
import { t } from 'c-3po';
const name = 'Mike';
console.log(t`Hello ${name}`);
```
So you can see that you can use native es6 template formatting. To make your string translatable, all you need to do is to place 't' tag.

Translator will see this inside .po files:
```po
#: src/page.js:8
msgid "Hello ${ 0 }"
msgstr ""
```
Plural example
==============
Here is how you can handle plural forms:
> This function has something similar with standart ngettext but behaves a little bit different. It assumes that you have only one form in your sources and other forms will be added in .po files. This is because different languages has different number of plural forms, and there are cases when your default language is not english, so it doesn't make sense to specify 2 plural forms at all.

```javascript
import { nt } from 'c-3po';
const name = 'Mike';
const n = 5;
console.log(nt(n)`Mike has ${n} banana`);
```

Output in .po files:
```po
#: src/PluralDemo.js:18
msgid "Mike has ${n} banana"
msgid_plural "Mike has ${n} banana"
msgstr[0] ""
msgstr[1] ""
```

Use case with jsx (react):
==========================
There are no additional setup for making this plugin work inside jsx. (just add babel-plugin-react plugin to your .babelrc)

```javascript
import React from 'react';
import { t, nt } from 'c-3po';

class PluralDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
        this.countInc = this.countInc.bind(this);
    }
    countInc() {
        this.setState({ count: this.state.count + 1 });
    }
    render() {
        const n = this.state.count;
        return (
            <div>
                <h3>{ t`Deadly boring counter demo (but with plurals)` }</h3>
                <div>{ nt(n)`You have clicked ${n} times` }</div>
                <button onClick={this.countInc}>{ t`Click me` }</button>
            </div>
        )
    }
}

export default PluralDemo;
```
Disabling some code parts
=========================
If for some reason you need to disable c-3po plugin transformation for some code block
you can use special comment globally to disable the whole file or inside some code block (function):
```javascript
/* disable c-3po */

// or
function test() {
    /* disable c-3po */
}
```

Contribution
============
Feel free to contribute, make sure to cover your contributions with tests.
Test command:
```
make test
```

Documentation  - [https://c-3po.js.org/](https://c-3po.js.org/)
=============

License
=======

[MIT License](LICENSE).
