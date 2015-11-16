var modDir = __dirname + '/../src/host/';
var fs = require ('fs');
var coffee = require ('coffee-script');
require (__dirname + '/../build/helper.js');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];

	// Check if is disabled
	if (moduleDisabled(fn))
		return ;

	var msg = '/* Compiled from ' + m + ' */\n';
	var fileContent = fs.readFileSync (modDir + m).toString()
		.replace(/;\s*$/, '')
		.replace(/^MODULE\s*/, '');

	if (m.slice(-3) === '.js') {
		ret.push (msg + fileContent);
	} else if (m.slice(-7) === '.coffee') {
		ret.push (msg + coffee.compile (fileContent, {bare: true}));
	} else {
		console.error ('Unknown file %s, skip...', m);
	}
});

module.exports = ret.join (',\n');