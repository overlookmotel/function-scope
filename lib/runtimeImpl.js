'use strict';

module.exports = {
	getGeneratorScopeCount(gen) {
		return %GetGeneratorScopeCount(gen);
	},
	getGeneratorScopeDetails(gen, index) {
		return %GetGeneratorScopeDetails(gen, index);
	},
	setGeneratorScopeVariableValue(gen, index, varName, value) {
		return %SetGeneratorScopeVariableValue(gen, index, varName, value);
	},
	functionGetScriptId(fn) {
		return %FunctionGetScriptId(fn);
	},
	functionGetScriptSourcePosition(fn) {
		return %FunctionGetScriptSourcePosition(fn);
	},
	functionGetScriptSource(fn) {
		return %FunctionGetScriptSource(fn);
	},
	functionGetSourceCode(fn) {
		return %FunctionGetSourceCode(fn);
	},
	liveEditPatchScript(fn, src) {
		return %LiveEditPatchScript(fn, src);
	},
	/*
	 * Home Object Symbol allows access to object referenced by `super`.
	 * ```js
	 * o = { method() { return super.method(); } };
	 * o.method[%HomeObjectSymbol()] === o;
	 *
	 * class X {}
	 * class Y extends X {
	 *   static staticMethod() { return super.staticMethod(); }
	 *   protoMethod() { return super.protoMethod(); }
	 * }
	 * Y.staticMethod[%HomeObjectSymbol()] === Y;
	 * Y.prototype.protoMethod[%HomeObjectSymbol()] === Y.prototype;
	 * ```
	 */
	homeObjectSymbol() {
		return %HomeObjectSymbol();
	}
};
