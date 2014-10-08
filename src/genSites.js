var modDir = __dirname + '/host/';
var fs = require ('fs');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	if (m.slice(-3) === '.js' || m.slice(-7) === '.coffee') {
		var file = fs.readFileSync (modDir + m).toString ();
		var name = file.match (/name\s*:\s*'([^']+)/);
		name = name ? name[1] : m.slice(-3);
		var hosts = file.match (/host\s*:\s*(\[.+?\]|'[^']+)/)[1].replace(/'/g, '').replace (/\/\*[\s\S]+\*\//g, '');
		if (hosts[0] !== '[')
			hosts = '[' + hosts + ']';

		ret.push (name + ' - `' + hosts + '`');
	}
});

module.exports = ret.join ('\n- ');

// console.info (module.exports);