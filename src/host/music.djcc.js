{
	id: 'music.djcc',
	name: 'DJCC 舞曲',
	host: ['www.djcc.com'/* , 'www.dj.cc' */],
	noSubHost: true,

	path: ['/dj/', '/play.php'],
	missingDomain5: 'http://down.djcc.com/music/',

	onStart: function () {
		H.waitUntil ('$.post', function () {
			console.info ('执行 VIP 破解 (play.php 页面无效) ..');
			unsafeExec (function (scriptHome, scriptName) {
				console.info (scriptHome);
				var _post = $.post;
				$.post = function (addr, cb) {
					if (addr == '/ajax.php?ajax=userinfo') {
						return _post.call (window.$, addr, function (s) {
							if (s == '')
								s = [1, scriptName, 0, scriptHome, 0, 0,
									99999999, 99999999, 0, 0, 2, '尊贵的 ' + scriptName + ' 用户', '9年'].join('*wrf*');

							cb (s);
						});
					}
					return _post.apply (window.$, arguments);
				};

				return function () {};
			}, H.scriptHome, H.scriptName);
		});

		// 播放器劫持
		H.waitUntil ('jwplayer.api', function () {
			unsafeExec (function () {
				var _sp = window.jwplayer.api.selectPlayer;
				window.jwplayer.api.selectPlayer = function (sel) {
					var mPlayer = _sp (sel);
					var _setup = mPlayer.setup;
					mPlayer.setup = function (options) {
						console.info ('setup', options);
						var _opl = options.events.onPlaylistItem;
						options.events.onPlaylistItem = function (eventPlaylistChange) {
							document.dispatchEvent ( new CustomEvent (H.scriptName, {detail: JSON.stringify (mPlayer.getPlaylistItem ())}) );
							return _opl.apply (this, arguments);
						};

						return _setup.apply (mPlayer, arguments);
					};
					return mPlayer;
				};
			});
		});

		this.dlLink1 = $('<a>').text ('试听下载').attr ('target', '_blank');
		this.dlLink2 = $('<a>').text ('高清下载').attr ('target', '_blank');

		// 下载数据解析
		document.addEventListener (H.scriptName, function (e) {
			var songObj = JSON.parse (e.detail);
			if (H.beginWith (songObj.file, wrfJw.Player.domain[0]))
				songObj.file = songObj.file.slice (wrfJw.Player.domain[0].length);

			this.dlLink1.attr ('href', H.uri (wrfJw.Player.domain[0] + songObj.file , songObj.title + '.mp3'));
			this.dlLink2.attr ('href', H.uri (missingDomain5 + (songObj.file2 || songObj.file), songObj.title + '.高清.mp3'));
			H.info (songObj);
		}.bind(this), false);
	},

	onBody: function () {
		$('#listtabs')
			.append (this.dlLink1)
			.append (this.dlLink2)
			.css ('height', 'initial')
			.css ('min-height', '160');
	}
}