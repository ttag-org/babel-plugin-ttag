# babel-plugin-ttag
[![travis](https://api.travis-ci.org/ttag-org/babel-plugin-ttag.svg)](https://travis-ci.org/ttag-org)
[![codecov](https://codecov.io/gh/ttag-org/babel-plugin-ttag/branch/master/graph/badge.svg)](https://codecov.io/gh/ttag-org/babel-plugin-ttag)

[![NPM](https://nodei.co/npm/babel-plugin-ttag.png?downloads=true)](https://nodei.co/npm/babel-plugin-ttag/)

> :warning: This project [was previously named `babel-plugin-c-3po`](https://github.com/ttag-org/ttag/issues/105).
> Some of the talks, presentations, and documentation _may_ reference it with both names.

## project description
Solution for providing gettext like translations into your project. Uses es6 native template syntax.

## documentation - [c-3po.js.org](http://c-3po.js.org)

Plugin functions:
- extracting translations from es6 tagged templates to .pot 
- resolving translations from .po files right into your sources at compile time.

Key features:
The core features of this tool are:

- Works with GNU gettext tool (.po files).
- Use es6 tagged templates syntax for string formatting (no extra formatting rules, no sprintf e.t.c).
- The most intelligent gettext functions extraction from javascript sources (babel plugin).
- Resolves translations from .po files right into your code (no runtime extra work in browser).
- Works with everything that works with babel (.jsx syntax for instance).
- Fast feedback loop (alerts when some string is missing translation right at compile time)
- Designed to work with universal apps (works on a backend and a frontend).

## Tutorials
* [Quick Start](https://c-3po.js.org/quick-start.html)
* [Localization with webpack and ttag](https://c-3po.js.org/localization-with-webpack-and-c-3po.html)

Installation
============

`npm install --save-dev babel-plugin-ttag && npm install --save ttag`


gettext example
===============
Here is how you code will look like while using this plugin:

```javascript
import { t } from 'ttag';
const name = 'Mike';
console.log(t`Hello ${name}`);
```
So you can see that you can use native es6 template formatting. To make your string translatable, all you need to do is to place 't' tag.

Translator will see this inside .po files:
```po
#: src/page.js:8
msgid "Hello ${ name }"
msgstr ""
```
Plural example
==============
Here is how you can handle plural forms:
> This function has something similar with standart ngettext but behaves a little bit different. It assumes that you have only one form in your sources and other forms will be added in .po files. This is because different languages has different number of plural forms, and there are cases when your default language is not english, so it doesn't make sense to specify 2 plural forms at all.

```javascript
import { ngettext, msgid } from 'ttag';
const name = 'Mike';
const n = 5;
console.log(ngettext(msgid`Mike has ${n} banana`, `Mike has ${n} bananas`, n));
```

Output in .po files:
```po
#: src/PluralDemo.js:18
msgid "Mike has ${ n } banana"
msgid_plural "Mike has ${ n } bananas"
msgstr[0] ""
msgstr[1] ""
```

Use case with jsx (react):
==========================
There are no additional setup for making this plugin work inside jsx. (just add babel-plugin-react plugin to your .babelrc)

```javascript
import React from 'react';
import { t, ngettext, msgid } from 'ttag';

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
                <div>{ ngettext(msgid`You have clicked ${n} time`, `You have clicked ${n} times`, n) }</div>
                <button onClick={this.countInc}>{ t`Click me` }</button>
            </div>
        )
    }
}

export default PluralDemo;
```

Disabling some code parts
=========================
If for some reason you need to disable ttag plugin transformation for some code block
you can use special comment globally to disable the whole file or inside some code block (function):
```javascript
/* disable ttag */

// or
function test() {
    /* disable ttag */
}
```

Contribution
============
Feel free to contribute, make sure to cover your contributions with tests.
Test command:
```
make test
```

License
=======

[MIT License](LICENSE).
