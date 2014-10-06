{
	name: 'QQ 音乐下载解析',
	host: 'y.qq.com',
	noSubHost: true,

	css: <% ~com.qq.y.dl.css %>,
	onBody: function () {
		H.waitUntil ('MUSIC.module.webPlayer.interFace.getSongUrl', function () {
			var dlBtn = $('<a>')
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
						mp3: 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3'.jstpl_format({
							stream: parseInt(songObj.mstream, 10) + 10,
							sid: parseInt(songObj.mid, 10) + 30000000
						}),
						name: songObj.msong
					} }) );

					return oldGetSong.apply (this, arguments);
				};
			}, H.scriptName);

			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlBtn.attr ({
					href: H.uri (songObj.mp3, songObj.name + '.mp3'),
					title: '下载: ' + songObj.name
				});
			}, false);
		});
	}
}