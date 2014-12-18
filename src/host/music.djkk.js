{
	id: 'music.djkk',
	name: 'DJ 嗨嗨',
	host: 'www.djkk.com',
	noSubHost: true,
	css: <% ~com.djkk.dl.css %>,

	onStart: function () {
		this.dlHolder = $('<div id="jx_dl_wrapper">');
		this.dlLink   = $('<a>').text('下载').appendTo (this.dlHolder);

		H.jPlayerPatcher (function (songObj) {
			var songAddr  = songObj.mp3 || songObj.m4a;
			var songTitle = songObj.title || $('#playTitle .jp-title').text().replace(/.+：/, '');
			
			this.dlLink
				.attr ('href', H.uri(songAddr, songTitle + songAddr.slice(-4)) )
				.attr ('title', '下载: ' + songTitle);
		}.bind (this));
	},

	onBody: function () {
		this.dlHolder.appendTo ($('.main-panel'));
	}
}