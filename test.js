/* eslint-disable no-console */

'use strict';

// eslint-disable-next-line node/no-unpublished-require
const getFunctionInfo = require('./build/Release/addon.node');

const x = 1;
function testFn() {
	return x;
}

console.log(getFunctionInfo(testFn));
