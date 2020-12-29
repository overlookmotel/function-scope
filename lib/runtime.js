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
	}
};
