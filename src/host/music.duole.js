{
	id: 'music.duole',
	name: '多乐音乐',
	host: 'www.duole.com',
	noSubHost: true,

	onBody: function () {
		var btnPrevSong = $('#player_right .last'),
			btnDownload = btnPrevSong.clone();
		
		$('#player_right').animate({
			'width': '+=32'
		}, 500);
		
		var songInfo = $('a.music_info').css({
			'cursor': 'text'
		}).removeAttr('href');


		var mo = new MutationObserver (function () {
			if (songInfo[0].hasAttribute('href'))
				songInfo.removeAttr ('href');
		}.bind (this));
		mo.observe (songInfo[0], {
			attributes: true
		});

		btnDownload.insertBefore(btnPrevSong.prev()).removeClass('last').css({
			'width': '0',
			'display': 'inline',
			'background-position': '-150px -104px'
		}).css(H.makeRotateCss(90)).animate({
			'width': '+=32'
		}, 500).attr('target', '_blank');
		
		var oldPlayNew = unsafeWindow.duolePlayer.playNew;
		var randomId;

		unsafeOverwriteFunctionSafeProxy ({
			playNew: (function (t, n) {
				document.dispatchEvent (
					new CustomEvent (H.scriptName, {detail: JSON.stringify ({
						mp3: t,
						info: this.curMusic
					})})
				);

				throw new ErrorUnsafeSuccess ();
			}).bind(unsafeWindow.duolePlayer)
		}, unsafeWindow.duolePlayer, '.duolePlayer');

		document.addEventListener (H.scriptName, function (e) {
			var songObj  = JSON.parse (e.detail),
				songInfo = songObj.info;

			btnDownload.attr({
				href: H.uri (songObj.mp3, songInfo.song_name + ' [' + songInfo.album_name + '] - ' + songInfo.singer_name + '.mp3'),
				title: '单击下载: ' + songInfo.song_name
			});
		}, false);
	}
}