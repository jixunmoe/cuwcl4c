var fs = require ('fs');
require ('./build/helper.js');

var args = (function (argv) {
	var ret = {};
	argv.slice(2).forEach(function (e) {
		if (e[0] === '-') {
			var param = e.slice(1).split('=');
			if (param.length == 1) {
				param.push(true);
			}
			ret[param[0]] = param[1];
		}
	});
	return ret;
})(process.argv);

global.resDir = __dirname + '/res/';
global.srcDir = __dirname + '/src/';
global.outDir = __dirname + '/out/';
global.buildDir = __dirname + '/build/';

function parseFile (s) {
	return s.toString().replace(/<% ([~#\$@])(.+?) %>/g, function (z, code, file) {
		var ret = [];
		switch (code) {
			case '~':
				ret.push ('/* Resource: ' + file + ' */');
				ret.push ('(`' + parseFile(readFile (resDir + file)) + ')`');
				break;

			case '$':
				ret.push (parseFile(readFile (resDir + file)));
				break;

			case '#':
				ret.push (parseFile(require (buildDir + file)));
				break;
			
			case '@':
				ret.push (parseFile(readFile (srcDir + file)));
				break;
		}

		return ret
			.join('\n');
	});
};

function readFile (file) {
	return fs.readFileSync(file, 'UTF-8');
}

if (args.code) {
	fs.writeFileSync(args.out, parseFile(args.code));
} else {
	fs.writeFileSync(args.out, parseFile(readFile(args.input)));
}
