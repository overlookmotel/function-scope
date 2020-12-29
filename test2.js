/* eslint-disable no-console */

'use strict';

const {getScopeValues, revertValues} = require('./lib/index.js');

/*
function dynamic() {
	console.log('dynamic called');
	return 'a';
}
*/

const x = {abc: 111};
function outer(y) {
	return function inner(z) {
		return [
			function a() {
				return [x, y, z];
			},
			function b() {
				return [x, y];
			}
		];
	};
}

const inner1 = outer(222);
const [a1, b1] = inner1(333);
const [a2, b2] = inner1(444);

const infoA1 = getScopeValues(a1);
const infoB1 = getScopeValues(b1);
const infoA2 = getScopeValues(a2);
const infoB2 = getScopeValues(b2);
revertValues();

console.log('infoA1:', infoA1);
console.log('infoB1:', infoB1);
console.log('infoA2:', infoA2);
console.log('infoB2:', infoB2);

console.log('infoA1.values.x === infoB1.values.x:', infoA1.values.x === infoB1.values.x);
console.log('infoA1.values.y === infoB1.values.y:', infoA1.values.y === infoB1.values.y);
console.log('infoA1.values.x === infoB2.values.x:', infoA1.values.x === infoB2.values.x);
console.log('infoA1.values.y === infoB2.values.y:', infoA1.values.y === infoB2.values.y);

console.log('a1():', a1());
console.log('b2():', b2());
console.log('a1[0] === b2[0]:', a1[0] === b2[0]);
