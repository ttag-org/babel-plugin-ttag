/* eslint-disable */

function test1() {
	gt`simple string literal`;
}

function test2() {
	let a = 5;
	gt`simple string literal ${a}`;
}

function gettext() {
	gettext('test test test gettext');
}
