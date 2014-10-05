var fs = require ('fs');

global.resDir = __dirname + '/res/';
global.srcDir = __dirname + '/src/';
global.outDir = __dirname + '/out/';

var parseScript = function (s) {
	return s.toString().replace(/<% ([~#\$@])(.+?) %>/g, function (z, code, file) {
		var ret = [];
		switch (code) {
			case '~':
				ret.push ('/* Resource: ' + file + ' */');
				ret.push ('H.extract(function () { /*');
				ret.push (parseScript(fs.readFileSync (resDir + file)));
				ret.push ('*/})');
				break;

			case '$':
				ret.push (parseScript(fs.readFileSync (resDir + file)));
				break;

			case '#':
				ret.push (parseScript(require (srcDir + file)));
				break;
			
			case '@':
				ret.push (parseScript(fs.readFileSync (srcDir + file)));
				break;
		}

		return ret.join ('\n');
	});
};

fs.writeFile (outDir + 'CUWCL4C.user.js', parseScript (fs.readFileSync(srcDir + 'main.js')));