{
	name: 'QQ 音乐下载解析',
	host: 'y.qq.com',
	noSubHost: true,

	onStart: function () {
		H.injectStyle ( <% ~com.qq.y.dl.css %> );
	},

	onBody: function () {
		H.waitUntil ('MUSIC.module.webPlayer.interFace.getSongUrl', function () {
			$('<strong>')
				.addClass ('next_bt jx_dl_bt')
				.insertAfter ('.next_bt');

			var dlBtn = $('<a>').attr('title', '播放音乐, 即刻下载');

			unsafeExec (function () {
				var oldGetSong = window.MUSIC.module.webPlayer.interFace.getSongUrl;

				window.MUSIC.module.webPlayer.interFace.getSongUrl = function (songObj, cb) {
					document.dispatchEvent ( new CustomEvent (H.scriptName, {detail: {
						mp3: 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3'.jstpl_format({
							stream: parseInt(songObj.mstream, 10) + 10,
							sid: parseInt(songObj.mid, 10) + 30000000
						}),
						name: songObj.msong
					} }) );

					return oldGetSong.apply (this, arguments);
				};
			});

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