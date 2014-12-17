// Generate site list for building 

var modDir = __dirname + '/../src/host/';
var fs = require ('fs');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];
	if (!moduleDisabled(fn) && (m.slice(-3) === '.js' || m.slice(-7) === '.coffee')) {
		var file = fs.readFileSync (modDir + m).toString ();
		var name = file.match (/name\s*:\s*'([^']+)/);
		name = name ? name[1] : m.slice(-3);
		var hosts = file.match (/host\s*:\s*(\[[\s\S]+?\]|'[^']+)/)[1]
			.replace(/'/g, '')
			.replace(/\s+/g, ' ')
			.replace (/\/\*[\s\S]+\*\//g, '');
		
		if (hosts[0] !== '[')
			hosts = '[' + hosts + ']';

		ret.push (name + ' - `' + hosts + '`');
	}
});

module.exports = ret.join ('\n- ');

// console.info (module.exports);