/* eslint-disable */

function test1() {
	console.log(gt`simple string literal`);
}

function test2() {
	let a = 5;
	console.log(gt`simple string literal ${a}`);
}

function test3() {
	let a = 5;
	console.log(nt(a)`plural shit ${a}`);
}

function gettext() {
	console.log(gettext('test test test gettext'));
}
