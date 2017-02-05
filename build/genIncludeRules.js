// Generate site list for building 

var modDir = __dirname + '/../src/site/';
var fs = require ('fs');

function english (count, s, p) {
	return count == 1 ? s : p;
}

var ret = [''];
fs.readdirSync (modDir).forEach (function (m) {
	var fn = m.match(/(.+)\./)[1];
	if (!moduleDisabled(fn) && m.slice(-3) === '.ts') {
		var file = fs.readFileSync (modDir + m, 'UTF-8');
		
		// 检查是否为子模块
		if (/\bsubModule\s*:\s*true\b/.test(file))
			return ;

		// 寻找所有规则并加入
		console.info(`\n[*] Parse include rule from ${m}...`);
		file.replace(/:\s*\w+Rule\s*=\s*\{([\s\S]+?)onStart/g, function (z, rule) {
			var hosts = rule.match (/host\s*:\s*(\[[\s\S]+?\]|'[^']+)/)[1]
				.replace(/'/g, '')
				.replace(/\s/g, '')
				.replace (/\/\*[\s\S]+\*\//g, '');
			
			var noSubHost = /\bincludeSubHost\s*:\s*false\b/.test(rule);
			var useSsl = /\bssl\s*:\s*true\b/.test(rule);
			
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

			console.info(`    - ${hosts.length} ${english(hosts.length, 'host', 'hosts')} added.`);
		});
	}
});

module.exports = '////               [Include Rules]\n' + ret.join('\n// @include ');

