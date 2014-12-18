{
	id: 'music.djye',
	name: 'DJ 爷爷网',
	host: 'www.djye.com',
	noSubHost: true,
	path: '/Player/',
	css : <% ~com.djye.dl.css %>,

	toMp3: function (song) {
		return song.replace(/[a-z]*\./, 'mp3.').replace(/m4a$/, 'mp3?type=down');
	},

	onStart: function () {
		this.linkHolder = $('<p id="jx_dl_btn">');
		this.linkM4A = $('<a>').appendTo (this.linkHolder).text ('试听音质');
		this.linkHolder.append (' | ');
		this.linkMP3 = $('<a>').appendTo (this.linkHolder).text ('MP3')
			.attr ('title', '请注意: 该链接可能因为服务器配置更新导致无法下载');

		H.jPlayerPatcher (function (songObj) {
			var songLink = songObj.m4a.replace(/\?.*/, '');
			var songTitle = $('#play_title').text ();

			this.linkM4A.attr('href', H.uri (songLink, songTitle + '.m4a'));
			this.linkMP3.attr('href', H.uri (this.toMp3(songLink), songTitle + '.mp3'));
		}.bind (this));
	},

	onBody: function () {
		this.linkHolder
			.appendTo ($('.playerMain-03'))
			.prev().css('padding-left', 25);
	}
}