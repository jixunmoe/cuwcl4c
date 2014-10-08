var modDir = __dirname + '/host/';
var fs = require ('fs');
var coffee = require ('coffee-script');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	if (m.slice(-3) === '.js')
		ret.push (fs.readFileSync (modDir + m));
	else if (m.slice(-7) === '.coffee')
		ret.push (
			coffee.compile (fs.readFileSync (modDir + m).toString(), {bare: true})
				// 修正结尾的 ;
				.replace(/;\s*$/, '')
		);
});

module.exports = ret.join (',\n');