{
	id: 'fm.jing',
	name: 'Jing.fm',
	host: 'jing.fm',
	noSubHost: true,

	onStart: function () {
		this.dlBox = $('<a>').css({
			position: 'absolute',
			right: 0,
			zIndex: 9
		}).attr('target', '_blank').text('下载');

		H.jPlayerPatcher (function (songObj) {
			this.dlBox
				.attr ( 'href', H.getFirstValue (songObj).replace(/\?.+/, '') )
				.attr ( 'title', $('#mscPlr > .tit').text () );
		}.bind (this));

		H.waitUntil ('Player.load', function () {
			unsafeOverwriteFunctionSafeProxy ({
				load: function () {
					setTimeout (function () {
						document.dispatchEvent ( new CustomEvent ('jx_jing_fm_player_loaded') );
					}, 100);

					throw new ErrorUnsafeSuccess();
				}
			}, unsafeWindow.Player, '.Player');
		});

		document.addEventListener ('jx_jing_fm_player_loaded', function () {
			H.info ('Jing.fm 播放器加载完毕');
			this.dlBox.appendTo($('#mscPlr'));
		}.bind (this), false);
	}
}