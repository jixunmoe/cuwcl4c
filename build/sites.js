var modDir = __dirname + '/../src/host/';
var fs = require ('fs');
var coffee = require ('coffee-script');
require (__dirname + '/../build/helper.js')

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];

	// Check if is disabled
	if (moduleDisabled(fn))
		return ;


	var msg = '/* Compiled from ' + m + ' */\n';

	if (m.slice(-3) === '.js') {
		ret.push (msg + fs.readFileSync (modDir + m));
	} else if (m.slice(-7) === '.coffee') {
		ret.push (
			msg + 
			coffee.compile (fs.readFileSync (modDir + m).toString(), {bare: true})
				// 修正结尾的 ;
				.replace(/;\s*$/, '')
		);
	} else {
		console.error ('Unknown file %s, skip...', m);
	}
});

module.exports = ret.join (',\n');