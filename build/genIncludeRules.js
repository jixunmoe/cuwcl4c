// Generate site list for building 

var modDir = __dirname + '/../src/site/';
var fs = require ('fs');

var ret = [''];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];
	if (!moduleDisabled(fn) && m.slice(-3) === '.ts') {
		var file = fs.readFileSync (modDir + m, 'UTF-8');
		
		// 检查是否为子模块
		if (/\bsubModule\s*:\s*true\b/.test(file))
			return ;

		var hosts = file.match (/host\s*:\s*(\[[\s\S]+?\]|'[^']+)/)[1]
			.replace(/'/g, '')
			.replace(/\s/g, '')
			.replace (/\/\*[\s\S]+\*\//g, '');
		
		var noSubHost = /\bincludeSubHost\s*:\s*false\b/.test(file);
		var useSsl = /\bssl\s*:\s*true\b/.test(file);
		
		if (hosts[0] == '[') {
			hosts = hosts.slice(1,-1).split(',');
		} else {
			hosts = [hosts];
		}
		
		// TODO: path parse
		hosts.forEach(function (host) {
			if (!host)
				return ;
			
			ret.push('http://' + host + '/*');
			if (useSsl) ret.push('https://' + host + '/*');
			
			if (!noSubHost) {
				ret.push('http://*.' + host + '/*');
				if (useSsl) ret.push('https://*.' + host + '/*');
			}
		});
	}
});

module.exports = '////               [Include Rules]\n' + ret.join('\n// @include ');

