{
	name: 'QQ 音乐下载解析',
	host: 'y.qq.com',
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
		});
	}
}