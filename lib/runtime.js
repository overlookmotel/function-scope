'use strict';

// Enable natives syntax
const v8 = require('v8'); // eslint-disable-line import/newline-after-import
v8.setFlagsFromString('--allow-natives-syntax');

module.exports = require('./runtimeImpl.js');
