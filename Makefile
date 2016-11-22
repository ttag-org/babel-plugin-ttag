SHELL := /bin/bash
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export NODE_PATH = ./

MOCHA_CMD = mocha --compilers js:babel-core/register

test_extract_gettext:
	$(MOCHA_CMD) ./tests/functional/test_extract_gettext_simple.js

test_extract_gettext_with_formatting:
	$(MOCHA_CMD) ./tests/functional/test_extract_gettext_with_formatting.js

test_extract_ngettext:
	$(MOCHA_CMD) ./tests/functional/test_extract_ngettext.js

test_resolve_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_gettext.js

test_resolve_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_default.js

test_resolve_strip_polyglot_tags:
	$(MOCHA_CMD) ./tests/functional/test_resolve_strip_polyglot_tags.js

test_resolve_ngettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext.js

test_unit:
	$(MOCHA_CMD) ./tests/unit/**/*.js

test_fun: test_extract_gettext test_extract_gettext_with_formatting
test_fun: test_extract_ngettext test_resolve_gettext
test_fun: test_resolve_default
test_fun: test_resolve_strip_polyglot_tags
test_fun: test_resolve_ngettext
test_fun: test_unit

test: test_fun
test: test_unit