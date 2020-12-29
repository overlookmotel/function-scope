'use strict';

// Enable natives syntax
const v8 = require('v8'); // eslint-disable-line import/newline-after-import
v8.setFlagsFromString('--allow-natives-syntax');

// Modules
const {readFileSync} = require('fs'),
	assert = require('simple-invariant');

// Imports
const {
		getGeneratorScopeCount, getGeneratorScopeDetails, setGeneratorScopeVariableValue,
		liveEditPatchScript
	} = require('./runtime.js'),
	getFunctionInfo = require('./functionInfo.node');

// Constants
const CAPTURE_VAR = '__capture';

// Exports

module.exports = {
	getScopes,
	getScopeValues,
	revertValues
};

function getScopes(gen) {
	const count = getGeneratorScopeCount(gen);

	const scopes = [];
	for (let i = 0; i < count; i++) {
		const [type, values, name, start, end] = getGeneratorScopeDetails(gen, i);
		scopes.push({type, values, name, start, end});
	}
	return scopes;
}

let nextFunctionId = 1;
const valueHolders = [];

class ValueHolder {
	constructor(value, scopeIndex, varName, iterator) {
		this.value = value;
		this.scopeIndex = scopeIndex;
		this.varName = varName;
		this.iterator = iterator;
	}
}

function getScopeValues(fn) {
	const {path} = getFunctionInfo(fn);

	const fnSrc = fn.toString();
	const match = fnSrc.match(/\/\*livepack_functionId:(\d+)\*\//);

	let functionId;
	if (match) {
		functionId = match[1] * 1;
	} else {
		functionId = patchFunction(fn, fnSrc, path);
	}

	let gen;
	global[CAPTURE_VAR] = (_gen) => { gen = _gen; };
	fn();
	global[CAPTURE_VAR] = undefined;

	const iterator = gen();
	const scopes = getScopes(iterator);
	// console.log('scopes:', scopes);

	const values = {};
	scopes.forEach((scope, scopeIndex) => {
		if (scope.type !== 3) return;

		const scopeValues = scope.values;
		for (const varName in scopeValues) {
			let value = scopeValues[varName];
			if (!(value instanceof ValueHolder)) {
				value = new ValueHolder(value, scopeIndex, varName, iterator);
				valueHolders.push(value);

				setGeneratorScopeVariableValue(iterator, scopeIndex, varName, value);
			}
			values[varName] = value;
		}
	});

	return {functionId, values};
}

function patchFunction(fn, fnSrc, path) {
	const fileSrc = readFileSync(path, 'utf8');

	const functionId = nextFunctionId++;

	const fnIndex = fileSrc.indexOf(fnSrc);
	assert(fnIndex !== -1);

	const openIndex = fnSrc.indexOf('{');
	assert(openIndex !== -1);

	const start = fnIndex + openIndex + 1;
	const srcNew = fileSrc.slice(0, start) // eslint-disable-line prefer-template
		+ `/*livepack_functionId:${functionId}*/`
		+ `if (global.__capture) return global.${CAPTURE_VAR}(function*() {});`
		+ fileSrc.slice(start);
	// console.log('srcNew:', srcNew);

	liveEditPatchScript(fn, srcNew);

	return functionId;
}

function revertValues() {
	for (const {value, scopeIndex, varName, iterator} of valueHolders) {
		setGeneratorScopeVariableValue(iterator, scopeIndex, varName, value);
	}

	valueHolders.length = 0;
}
