var buildOptions = require('js-yaml').safeLoad(require('fs').readFileSync(__dirname + '/build.yaml'));

global.moduleDisabled = function (module) {
	return -1 != buildOptions.disabled.indexOf(module)
};