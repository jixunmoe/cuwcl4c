{
	id: 'fm.moe',
	name: '萌电台 [moe.fm]',
	host: 'moe.fm',
	noSubHost: true,
	hide: ['#promotion_ls'],

	onBody: function () {
		H.waitUntil('playerInitUI', function () {
			// 登录破解
			unsafeWindow.is_login = true;
			
			var dlLink = $('<a>').addClass('player-button left').css(H.makeRotateCss(90)).css({
				'width': '26px',
				'background-position': '-19px -96px'
			}).insertAfter ($('div.player-button.button-volume').first());
			
			unsafeOverwriteFunctionSafeProxy ({
				playerInitUI: function (songObj) {
					dlLink.attr('href', songObj.completeUrl).attr('title', '单击下载: ' + songObj.title);
					throw new ErrorUnsafeSuccess();
				}
			});
		});
	}
}