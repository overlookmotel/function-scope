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
	liveEditPatchScript(fn, src) {
		return %LiveEditPatchScript(fn, src);
	},
	/*
	 * Home Object Symbol allows access to object referenced by `super`.
	 * ```js
	 * o = { method() { return super.method(); } };
	 * o.method[%HomeObjectSymbol()] === o;
	 *
	 * class X { method() { return 1; } }
	 * class Y extends X { method() { return super.method(); } }
	 * Y.prototype.method[%HomeObjectSymbol()] === Y.prototype;
	 * ```
	 */
	homeObjectSymbol() {
		return %HomeObjectSymbol();
	}
};
