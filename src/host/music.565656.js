{
	id: 'music.565656',
	name: '565656 音乐',
	host: 'www.565656.com',
	noSubHost: true,
	path: ['/plus/player.ashx', '/ting/'],

	onStart: function () {
		H.jPlayerPatcher (function (songObj) {
			var songAddr = songObj.mp3 || songObj.m4a;
			$('.play-info-otheropt > a:last')
				.attr('href', H.uri (songAddr, songObj.songname + songObj.m4a.slice(-4)))
				.find('span').text('下载: ' + songObj.songname + ' - ' + songObj.singername);
		});
	}
}