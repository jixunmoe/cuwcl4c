{
	id: 'music.1ting',
	name: '一听音乐',
	host: ['www.1ting.com'],
	noSubHost: true,
	path: ['/player/', '/album_'],

	onBody: function () {
		this.dlBtn = $('.songact a.down')
			.text ('直接下载')
			.removeAttr('onclick');

		H.waitUntil ('yiting.player.entity.src', function () {
			unsafeExec (function () {
				var playTrigger = function () {
					// dlBtn.attr('href', window.yiting.player.entity.src);
					document.dispatchEvent ( new CustomEvent (H.scriptName) );
				};

				window.yiting.player.hook('play', playTrigger);
				playTrigger ();
			});
		});

		document.addEventListener (H.scriptName, this.eventHandler.bind (this), false);
		this.eventHandler ();
	},

	eventHandler: function () {
		var songTitle = $('.song .songtitle > a').text ();
		this.dlBtn.attr ({
			href: H.uri (unsafeWindow.yiting.player.entity.src, songTitle + '.mp3'),
			title: '下载: ' + songTitle
		});
	}
}