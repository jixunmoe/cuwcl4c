{
	id: 'music.djkk',
	name: 'DJ 嗨嗨',
	host: 'www.djkk.com',
	noSubHost: true,
	css: <% ~com.djkk.dl.css %>,

	onStart: function () {
		this.dlHolder = $('<div id="jx_dl_wrapper">');
		this.dlHolder.append('下载: ');
		this.dlHq     = $('<a>').text('高清').appendTo (this.dlHolder).prop('download', true);
		this.dlHolder.append(' | ');
		this.dlLink   = $('<a>').text('试听').appendTo (this.dlHolder).prop('download', true);

		H.jPlayerPatcher (function (songObj) {
			var songAddr  = songObj.mp3 || songObj.m4a;
			var songTitle = songObj.title || $('#playTitle .jp-title').text().replace(/.+：/, '');
			
			this.dlLink.attr({
				href: H.uri(songAddr, songTitle + songAddr.slice(-4)),
				title: '试听音质: ' + songTitle
			});

			this.dlHq.attr({
				href: H.uri(this.upgradeHQ(songAddr), songTitle + '.mp3'),
				title: '高清音质: ' + songTitle
			});
		}.bind (this));
	},

	// Source: 52pojie
	upgradeHQ: function (url) {
		return url
		         .replace(unsafeWindow.s_str, 'http://do.djkk.com/mp3')
		         .replace(/...$/, 'mp3')
	},

	onBody: function () {
		this.dlHolder.appendTo ($('.main-panel'));
	}
}