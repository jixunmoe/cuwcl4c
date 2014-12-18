{
	id: 'music.5sing',
	name: '5sing 下载解析',
	host: ['5sing.com', '5sing.kugou.com'],

	onStart: function () {
		if (H.beginWith(location.pathname, '/fm/')) {
			// e.g. http://5sing.kugou.com/fm/m/
			this._fmHook ();
		}
	},

	onBody: function () {
		if (H.contains(location.pathname, '/down/')) {
			this._dlPage ();
			return ;
		}

		// 旧版单曲播放页面
		H.waitUntil ('pageOptions.ticket', function () {
			var songObj = JSON.parse(H.base64Decode(unsafeWindow.pageOptions.ticket));
			$('.func_icon3>a').attr ({
				href: H.uri(songObj.file, songObj.songName + '.mp3'),
				title: '单击下载: ' + songObj.songName,
			}).html('<b/>直链下载');

			$('#play').css ({
				top: 'initial'
			});
			$('.song_play').css ({
				marginTop: '1em'
			});
			$('.rt2').hide();
			$('#report').parent().hide();
		});

		// 新版单曲播放页面
		H.waitUntil ('globals.ticket', function () {
			var songObj = JSON.parse(H.base64Decode(unsafeWindow.globals.ticket));
			$('.view_info>ul:last>li:first').replaceWith($('<li>').append (
				$('<a>').text('点我下载').attr({
					href: H.uri(songObj.file, songObj.songName + '.mp3'),
					title: '单击下载: ' + songObj.songName,
					target: '_blank'
				}).css ('color', '#F87877')
			));
		});
	},

	_dlPage: function () {
		var $dl = $('<p>').prependTo ($('.sing_view')).text('正在解析音乐地址…');

		$.get($('.main > h1 > a').attr('href')).success (function (res) {
			var songAddress = res.match(/"ticket"\s*:\s*\"(.+?)"/);
			if (songAddress) {
				var songObj = JSON.parse(H.base64Decode(songAddress[1]));
				songAddress = H.uri(songObj.file, songObj.songName + '.mp3');
			} else if (songAddress = res.match(/,\s*file\s*:\s*\"(.+?)"/)) {
				// 来源请求
				songAddress = songAddress[1];
			} else {
				$dl .text ('* 下载解析失败，请访问歌曲页解析。')
					.css ('color', 'red');
				return ;
			}

			$dl.text('解析完毕: ').append ($('<a>').attr({
				href: songAddress,
				target: '_blank'
			}).text('点我下载'));
		}).error (function () {
			$dl .text ('* 网络错误，请稍候重试或访问歌曲页解析。')
				.css ('color', 'red');
		});
	},

	_fmHook: function () {
		if (this.fmHooked) return ;
		this.fmHooked = true;

		H.hookDefine ('define', function (scriptName, _define, moduleName, requires, fCallback) {
			if ('player/single' === moduleName) {
				return _define (moduleName, requires, function (require, exports, module) {
					var ret = fCallback.call (null, require, exports, module);

					var $wsp = module.exports;
					var MediaElement = $wsp.mediaElement;
					$wsp.mediaElement = function (playerBoxId, options) {
						options.stats.enable = false;
						var mPlayer = new MediaElement (playerBoxId, options);
						var _play = mPlayer.play;
						mPlayer.play = function (songObj) {
							document.dispatchEvent ( new CustomEvent (scriptName, {detail: songObj}) );
							return _play.call (mPlayer, songObj);
						};
						return mPlayer;
					};
					return ret;
				});
			}
		}, H.scriptName);

		document.addEventListener (H.scriptName, function (e) {
			var songObj = e.detail;
			setTimeout (function () {
				$('.jp-download').attr ({
					href: H.uri(songObj.file, songObj.songName + '.mp3'),
					title: '下载: ' + songObj.songName
				});
			}, 1);
		}, false);
	},

}