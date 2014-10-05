var fs = require ('fs'),
	buildNumberFile = __dirname + '/build';

var digitBuildNumber = parseInt(fs.readFileSync (buildNumberFile), 10);
digitBuildNumber ++ ;
fs.writeFileSync (buildNumberFile, digitBuildNumber);
module.exports = digitBuildNumber.toString();