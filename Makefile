SHELL := /bin/bash
export PATH := $(PWD)/node_modules/.bin:$(PATH)
export NODE_PATH = ./

MOCHA_CMD = mocha --require @babel/register

test_extract_gettext:
	$(MOCHA_CMD) ./tests/functional/test_extract_gettext_simple.js

test_extract_fn_gettext:
	$(MOCHA_CMD) ./tests/functional/test_extract_fn_gettext.js

test_extract_gettext_with_formatting:
	$(MOCHA_CMD) ./tests/functional/test_extract_gettext_with_formatting.js

test_extract_filename:
	$(MOCHA_CMD) ./tests/functional/test_extract_filename.js

test_extract_developer_comments:
	$(MOCHA_CMD) ./tests/functional/test_extract_developer_comments.js

test_extract_developer_comments_by_tag:
	$(MOCHA_CMD) ./tests/functional/test_extract_developer_comments_by_tag.js

test_extract_ngettext:
	$(MOCHA_CMD) ./tests/functional/test_extract_ngettext.js

test_resolve_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_gettext.js

test_resolve_gettext_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_gettext_default.js

test_resolve_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_default.js

test_resolve_strip_polyglot_tags:
	$(MOCHA_CMD) ./tests/functional/test_resolve_strip_polyglot_tags.js

test_resolve_jsxtag_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_jsxtag_gettext.js

test_resolve_ngettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext.js

test_resolve_ngettext_default:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext_default.js

test_resolve_ngettext_default_for_locale:
	$(MOCHA_CMD) ./tests/functional/test_resolve_ngettext_default_for_locale.js

test_resolve_fn_gettext:
	$(MOCHA_CMD) ./tests/functional/test_resolve_fn_gettext.js

test_resolve_when_validation_fails:
	$(MOCHA_CMD) ./tests/functional/test_resolve_when_validation_fails.js

test_alias_resolve:
	$(MOCHA_CMD) ./tests/functional/test_alias_resolve.js

test_alias_discover:
	$(MOCHA_CMD) ./tests/functional/test_alias_discover.js

test_unresolved:
	$(MOCHA_CMD) ./tests/functional/test_unresolved.js

test_po_resolve:
	$(MOCHA_CMD) ./tests/functional/test_po_resolve.js

test_disabled_scope:
	$(MOCHA_CMD) ./tests/functional/test_disabled_scope.js

test_unit:
	$(MOCHA_CMD) ./tests/unit/**/*.js

test_entries_sort:
	$(MOCHA_CMD) ./tests/functional/test_entries_sort.js
	
test_entries_sort_by_msgctxt:
	$(MOCHA_CMD) ./tests/functional/test_entries_sort_by_msgctxt.js

test_sorted_entries_sort:
	$(MOCHA_CMD) ./tests/functional/test_sorted_entries_sort.js

test_sorted_entries_without_reference_line_num:
	$(MOCHA_CMD) ./tests/functional/test_sorted_entries_without_reference_line_num.js

test_empty_config:
	$(MOCHA_CMD) ./tests/functional/test_empty_config_mode.js

test_contexts_extract:
	$(MOCHA_CMD) ./tests/functional/test_contexts_extract.js

test_contexts_extract_from_file:
	$(MOCHA_CMD) ./tests/functional/test_contexts_extract_from_file.js

test_resolve_contexts:
	$(MOCHA_CMD) ./tests/functional/test_resolve_contexts.js

test_extract_numbered_expressions:
	$(MOCHA_CMD) ./tests/functional/test_extract_numbered_expressions.js

test_resolve_numbered_expressions:
	$(MOCHA_CMD) ./tests/functional/test_resolve_numbered_expressions.js

test_discover_by_require:
	$(MOCHA_CMD) ./tests/functional/test_discover_by_require.js

test_macro_resolve:
	$(MOCHA_CMD) ./tests/functional/test_macro_resolve.js

test_macro_extract:
	$(MOCHA_CMD) ./tests/functional/test_macro_extract.js

test_alias_extract:
	$(MOCHA_CMD) ./tests/functional/test_alias_extract.js

test_extract_js_format:
	$(MOCHA_CMD) ./tests/functional/test_extract_js_format.js


test_fun: test_extract_gettext
test_fun: test_extract_fn_gettext
test_fun: test_extract_gettext_with_formatting
test_fun: test_extract_filename
test_fun: test_extract_developer_comments
test_fun: test_extract_developer_comments_by_tag
test_fun: test_extract_ngettext
test_fun: test_resolve_gettext
test_fun: test_resolve_gettext_default
test_fun: test_resolve_default
test_fun: test_resolve_strip_polyglot_tags
test_fun: test_resolve_ngettext_default_for_locale
test_fun: test_resolve_ngettext
test_fun: test_resolve_ngettext_default
test_fun: test_resolve_jsxtag_gettext
test_fun: test_po_resolve
test_fun: test_unresolved
test_fun: test_resolve_fn_gettext
test_fun: test_alias_resolve
test_fun: test_disabled_scope
test_fun: test_resolve_when_validation_fails
test_fun: test_alias_discover
test_fun: test_entries_sort
test_fun: test_entries_sort_by_msgctxt
test_fun: test_sorted_entries_sort
test_fun: test_empty_config
test_fun: test_contexts_extract
test_fun: test_resolve_contexts
test_fun: test_contexts_extract_from_file
test_fun: test_extract_numbered_expressions
test_fun: test_resolve_numbered_expressions
test_fun: test_discover_by_require
test_fun: test_macro_resolve
test_fun: test_macro_extract
test_fun: test_alias_extract
test_fun: test_extract_js_format

test: test_fun
test: test_unit

lint:
	npm run lint
