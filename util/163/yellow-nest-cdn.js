var http = require('http');
var fs = require('fs');
var random_useragent = require('random-useragent');

var THREAD_COUNT = 5;

function generate_request (ip) {
	return {
		method: 'GET',
		port: 80,
		hostname: ip,
		path: '/m2.music.126.net/hvTY_PDCMhEbEMh4TfxqiA==/5931865231944544.mp3',
		headers: {
			'Range': 'bytes=0-2',
			'User-Agent': random_useragent.getRandom()
		}
	};
}

function unique (list) {
	return list.filter(function (e, i) {
		return e && e[0] != '#' && i === list.indexOf(e);
	});
}

var speeds = [];

var ips = unique(fs.readFileSync('./yellow-nest-cdn.txt', 'utf8').replace(/\r/g, '').split('\n'));

var hOutput = fs.openSync('./yellow-nest-cdn.ip.txt', 'w');
fs.writeSync(hOutput, '# 下面是检测可用的 ip 地址\n');

var complete = 0;
function next (thread_id) {
	if (ips.length === 0) {
		console.info('[%d] Complete.', thread_id);
		complete ++;
		if (complete == THREAD_COUNT) {
			fs.close(hOutput, function () {
				process.exit(0);
			});
		}
		return ;
	}

	var ip = ips.shift();
	var startTime;
	var req = http.request(generate_request(ip), function (r) {
		var _data = '';
		r.on('data', function (data) {
			_data += data;
		});

		r.on('end', function () {
			var time = new Date() - startTime;
			if (_data == 'ID3') {
				console.info('[%d] IP %s is ok:\t\t%d', thread_id, ip, time);
				fs.write(hOutput, ip + '\n', function ( ) {});
			} else {
				console.info('[%d] IP %s Failed', thread_id, ip);
			}

			next(thread_id);
		});

		r.on('error', function (err) {
			console.info('[%d] IP %s had an error: %s', thread_id, ip, err);
			next(thread_id);
		});

		r.setTimeout(2000, function () {
			console.info('[%d] IP %s had a timeout.', thread_id, ip);
			next(thread_id);
		});
	});

	req.on('error', function (err) {
		console.info('[%d] IP %s had an error: %s', thread_id, ip, err);
		next(thread_id);
	});

	startTime = new Date();
	req.end();
}

for (var i = 0; i < THREAD_COUNT; i++)
	next(i);