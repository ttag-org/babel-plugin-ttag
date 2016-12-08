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

test_extract_filename:
	$(MOCHA_CMD) ./tests/functional/test_extract_filename.js

test_resolve_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_gettext.js

test_resolve_gettext_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_gettext_default.js

test_resolve_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_default.js

test_resolve_strip_polyglot_tags:
	$(MOCHA_CMD) ./tests/functional/test_resolve_strip_polyglot_tags.js

test_resolve_ngettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext.js

test_resolve_ngettext_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext_default.js

test_resolve_fn_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_fn_gettext.js

test_alias_resolve:
	$(MOCHA_CMD) ./tests/functional/test_alias_resolve.js

test_unresolved:
	$(MOCHA_CMD) ./tests/functional/test_unresolved.js

test_po_resolve:
	$(MOCHA_CMD) ./tests/functional/test_po_resolve.js

test_disabled_scope:
	$(MOCHA_CMD) ./tests/functional/test_disabled_scope.js

test_unit:
	$(MOCHA_CMD) ./tests/unit/**/*.js

test_fun: test_extract_gettext
test_fun: test_extract_gettext_with_formatting
test_fun: test_extract_ngettext
test_fun: test_extract_filename
test_fun: test_resolve_gettext
test_fun: test_resolve_gettext_default
test_fun: test_resolve_default
test_fun: test_resolve_strip_polyglot_tags
test_fun: test_resolve_ngettext
test_fun: test_resolve_ngettext_default
test_fun: test_po_resolve
test_fun: test_unresolved
test_fun: test_resolve_fn_gettext
test_fun: test_alias_resolve
test_fun: test_disabled_scope

test: test_fun
test: test_unit