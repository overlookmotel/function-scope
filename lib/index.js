'use strict';

// Modules
const {readFileSync} = require('fs'),
	assert = require('simple-invariant');

// Enable natives syntax
const v8 = require('v8'); // eslint-disable-line import/newline-after-import
v8.setFlagsFromString('--allow-natives-syntax');

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
	getScopeValues,
	revertValues
};

let nextFunctionId = 1;
const functions = {},
	valueHolders = [];

class ValueHolder {
	constructor(value, scopeIndex, varName, gen) {
		this.value = value;
		this.scopeIndex = scopeIndex;
		this.varName = varName;
		this.gen = gen;
	}
}

function getScopeValues(fn) {
	const {path, line, column} = getFunctionInfo(fn);

	const fnPos = `${path}:${line}:${column}`;
	let fnRecord = functions[fnPos];
	if (!fnRecord) {
		fnRecord = patchFunction(fn, path);
		functions[fnPos] = fnRecord;
	}
	const {functionId, gen} = fnRecord;

	const scopes = getScopes(gen);
	// console.log('scopes:', scopes.filter(scope => scope.type !== 0));

	const values = {};
	scopes.forEach((scope, scopeIndex) => {
		if (scope.type !== 3) return;

		const scopeValues = scope.values;
		for (const varName in scopeValues) {
			let value = scopeValues[varName];
			if (!(value instanceof ValueHolder)) {
				value = new ValueHolder(value, scopeIndex, varName, gen);
				valueHolders.push(value);

				setGeneratorScopeVariableValue(gen, scopeIndex, varName, value);
			}
			values[varName] = value;
		}
	});

	return {functionId, values};
}

function getScopes(gen) {
	const count = getGeneratorScopeCount(gen);

	const scopes = [];
	for (let i = 0; i < count; i++) {
		const [type, values, name, start, end] = getGeneratorScopeDetails(gen, i);
		scopes.push({type, values, name, start, end, index: i});
	}
	return scopes;
}

function patchFunction(fn, path) {
	const fileSrc = readFileSync(path, 'utf8');

	const functionId = nextFunctionId++;

	const fnSrc = fn.toString();
	const fnIndex = fileSrc.indexOf(fnSrc);
	assert(fnIndex !== -1);

	const openIndex = fnSrc.indexOf('{');
	assert(openIndex !== -1);

	const start = fnIndex + openIndex + 1;
	const fileSrcPatched = fileSrc.slice(0, start) // eslint-disable-line prefer-template
		+ `return global.${CAPTURE_VAR}(function*() {});`
		+ fileSrc.slice(start);
	// console.log('fileSrcPatched:', fileSrcPatched);

	liveEditPatchScript(fn, fileSrcPatched);

	let genFn;
	global[CAPTURE_VAR] = (_genFn) => { genFn = _genFn; };
	fn();
	global[CAPTURE_VAR] = undefined;
	const gen = genFn();

	liveEditPatchScript(fn, fileSrc);

	return {functionId, gen};
}

function revertValues() {
	for (const {value, scopeIndex, varName, gen} of valueHolders) {
		setGeneratorScopeVariableValue(gen, scopeIndex, varName, value);
	}

	valueHolders.length = 0;
}
