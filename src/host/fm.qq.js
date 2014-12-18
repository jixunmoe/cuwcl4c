{
	id: 'fm.qq',
	name: 'QQ 电台下载解析',
	host: 'fm.qq.com',
	noSubHost: true,
	onBody: function () {
		H.log ('Waiting for fmQQ...');
		H.waitUntil('$.qPlayer.player.playUrl', function () {
			H.log ('fmQQ Hook start!');
			
			// CreateDLButton
			var dlLink = $('<a>').css(H.makeRotateCss(90)).css({
				'background-position': '-24px -73px'
			});
			$('.btn_del').after(dlLink);
			
			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlLink
					.attr('href', H.uri(songObj.songurl, songObj.msong + '.mp3'))
					.attr('title', '下载: ' + songObj.msong);
			}, false);

			unsafeExec (function () {
				var _playurl = window.$.qPlayer.player.playUrl.bind(window.$.qPlayer.player);
				var _updateUrl = function () {
					document.dispatchEvent ( new CustomEvent (H.scriptName, {detail: $.qPlayer.playList.getSongInfoObj() }) );
				}
				window.$.qPlayer.player.playUrl = function () {
					_updateUrl ();
					return _playurl.apply (0, arguments);
				};

				_updateUrl ();
			});

			H.log ('fmQQ Hook finish!');
		});
	}
}