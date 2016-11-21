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

test: test_extract_gettext test_extract_gettext_with_formatting
test: test_extract_ngettext test_resolve_gettext
test: test_resolve_default
test: test_resolve_strip_polyglot_tags
