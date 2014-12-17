var fs = require ('fs');
require ('./build/helper.js');

var args = (function (argv) {
	var ret = {};
	argv.slice(2).forEach(function (e) {
		if (e[0] === '-') {
			ret[e.slice(1).replace(/-./g, function (z){ return z[1].toUpperCase() })] = true;
		}
	});
	return ret;
})(process.argv);

global.resDir = __dirname + '/res/';
global.srcDir = __dirname + '/src/';
global.outDir = __dirname + '/out/';
global.buildDir = __dirname + '/build/';

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
				ret.push (parseScript(require (buildDir + file)));
				break;
			
			case '@':
				ret.push (parseScript(fs.readFileSync (srcDir + file)));
				break;
		}

		return ret.join ('\n');
	});
};

if (args.main)
	fs.writeFile (outDir + 'CUWCL4C.user.js',       parseScript (fs.readFileSync(srcDir + 'main.js')));



if (args.readme)
	fs.writeFile (__dirname + '/README.md',         parseScript (fs.readFileSync(__dirname + '/README.zh-CN.tpl.md')));


if (args.readmeZhTW)
	fs.writeFile (__dirname + '/README.zh-TW.md',   parseScript (fs.readFileSync(__dirname + '/README.zh-TW.tpl.md')));
