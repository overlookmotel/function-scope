/* eslint-disable no-console */

'use strict';

const getFunctionInfo = require('./lib/functionInfo.node');

const x = 1;
function testFn() {
	return x;
}

console.log(getFunctionInfo(testFn));
