{
	id: 'music.oyinyue',
	name: '噢音乐下载解析',
	host: 'oyinyue.com',

	onBody: function () {
		if (H.beginWith (location.pathname, '/Down.aspx')) {
			this.downPage ();
			return ;
		}

		H.waitUntil ('player.setUrl', function () {
			unsafeOverwriteFunctionSafeProxy ({
				setUrl: function (songUrl) {
					$('.func_icon4 > a').attr({
						'href': songUrl,
						'target': '_blank'
					}).html('<b/>直链下载');

					throw new ErrorUnsafeSuccess ();
				}
			}, unsafeWindow.player, '.player')
		});
	},

	downPage: function () {
		var $dl = $('<p>').prependTo ($('.sing_view')).text('正在解析音乐地址…');
		this.fetch ($_GET.id, function (songUrl) {

			$dl.text('解析完毕: ').append ($('<a>').attr({
				href: songUrl,
				target: '_blank'
			}).text('点我下载'));

		}, function () {
			$dl.text ('* 下载解析失败，请访问歌曲页解析。')
				.css ('color', 'red');
		});
	},

	fetch: function (songId, successCallback, failCallback) {
		$.ajax ({
			url: '/load/loadsong.ashx',
			method: 'POST',
			data: {
				songid: songId,
				id: 3
			},
			dataType: 'text'
		}).success (function (url) {
			if (url && url != '0') {
				successCallback (url);
			} else {
				failCallback ();
			}
		}).error (function () {
			failCallback ();
		});
	}
}