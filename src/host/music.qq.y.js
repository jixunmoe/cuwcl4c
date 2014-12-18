{
	id: 'music.qq.y',
	name: 'QQ 音乐下载解析',
	host: ['y.qq.com', 'soso.music.qq.com'],
	noSubHost: true,

	css: <% ~com.qq.y.dl.css %>,
	onBody: function () {
		if (H.config.dUriType == 1) {
			H.warn (
				'%s\n%s',
				'当前版本的协议尚未支援 Cookie 输入, 回滚至连接版',
				'如果您确实需要自动填入用户名, 请改用 Aria2 版'
			);

			H.config.dUriType = 0;
		}

		var styleToFix = this.styleBlock;

		H.waitUntil ('MUSIC.module.webPlayer.interFace.getSongUrl', function () {
			H.fixStyleOrder (styleToFix);

			var dlBtn = $('<a>')
				.addClass('aria-cookie')
				.attr('title', '播放音乐, 即刻下载')
				.appendTo (
					$('<strong>')
						.addClass ('next_bt jx_dl_bt')
						.insertAfter ('.next_bt')
				);

			unsafeExec (function (scriptName) {
				var oldGetSong = window.MUSIC.module.webPlayer.interFace.getSongUrl;

				window.MUSIC.module.webPlayer.interFace.getSongUrl = function (songObj, cb) {
					document.dispatchEvent ( new CustomEvent (scriptName, {detail: {
						host: 'http://stream' + (parseInt(songObj.mstream) + 10) + '.qqmusic.qq.com/',
						path: "M800" + songObj.mmid + ".mp3",
						name: songObj.msong + '[' + songObj.msinger + ']'
					} }) );

					return oldGetSong.apply (this, arguments);
				};
			}, H.scriptName);

			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlBtn.attr ({
					href: H.uri (songObj.host + songObj.path, songObj.name + '.mp3'),
					title: '下载: ' + songObj.name
				});
			}, false);
		}, 7000, 500);

		H.waitUntil ('MUSIC.widget.trackServ.formatMusic', function () {
			unsafeExec(function () {
				var _formatMusic = MUSIC.widget.trackServ.formatMusic;
				MUSIC.widget.trackServ.formatMusic = function () {
					var _music = _formatMusic.apply(this, arguments);

					_music.mstatus = parseInt(_music.mstatus) || 1;

					_music.msize = _music.msize || 1;
					_music.minterval = _music.minterval || 1;

					if (_music.msongurl) {
						var _pre;
						if (_music.size320) {
							_pre = 'M800';
						} else if (_music.size128) {
							_pre = 'M500';
						}

						if (_pre) {
							_music.msongurl = 'http://stream' + (parseInt(_music.mstream) + 10) +
												'.qqmusic.qq.com/' + _pre + _music.mmid + '.mp3';
						}
					}

					return _music;
				};

				var getVip = g_user.getVipInfo;
				g_user.getVipInfo = function (successCb, failCb) {
					return g_user.getVipInfo (function (info) {
						if (1 != info.vip) info.vip = 1;
						if (successCb) successCb (info);
					}, failCb);
				};
			});
		}, 7000, 500);
	}
}