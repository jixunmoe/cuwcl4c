{
	id: 'music.9ku',
	name: '9酷音乐',
	host: 'www.9ku.com',
	noSubHost: true,
	hide: ['#LR2', '#LR3', '#seegc', '.dongDown'],
	path: ['/play/', '/play.htm'],

	onStart: function () {
		this.dlLink = $('<a>')
			.attr ('target', '_blank')
			.attr ('title',  '正在抓取歌曲数据 ..')
			.text ('下载');

		H.jPlayerPatcher (function (songObj) {
			var songUrl  = songObj.mp3 || songObj.m4a,
				songName = $('#play_musicname').text();

			this.dlLink
				.attr ('href', H.uri (songUrl, songName + songUrl.slice(-4)))
				.attr ('title', '下载: ' + songName);
		}.bind (this));
	},

	onBody: function () {
		$('.ringDown').css ({
			float: 'none',
			display: 'block',
			textAlign: 'center'
		}).html (this.dlLink);
	}
}