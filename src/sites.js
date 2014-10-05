var modDir = __dirname + '/host/';
var fs = require ('fs');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	if (m.slice(-3) === '.js')
		ret.push (fs.readFileSync (modDir + m));
});

module.exports = ret.join (',\n');