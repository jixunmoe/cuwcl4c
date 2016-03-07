// Generate site list for building 

var modDir = __dirname + '/../src/host/';
var fs = require ('fs');

var ret = [''];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];
	if (!moduleDisabled(fn) && (m.slice(-3) === '.js' || m.slice(-7) === '.coffee')) {
		var file = fs.readFileSync (modDir + m).toString ();
		var hosts = file.match (/host\s*:\s*(\[[\s\S]+?\]|'[^']+)/)[1]
			.replace(/'/g, '')
			.replace(/\s/g, '')
			.replace (/\/\*[\s\S]+\*\//g, '');
		
		var noSubHost = /noSubHost\s*:\s*true/.test(file);
		
		if (hosts[0] == '[') {
			hosts = hosts.slice(1,-1).split(',');
		} else {
			hosts = [hosts];
		}
		
		// TODO: path parse
		hosts.forEach(function (host) {
			if (!host || host == 'localhost' || host == 'jixunmoe.github.io')
				return ;
			
			ret.push('http://' + host + '/*');
			
			if (!noSubHost) {
				ret.push('http://*.' + host + '/*');
			}
		});
	}
});

module.exports = ret.join ('\n// @include ');

// console.info (module.exports);