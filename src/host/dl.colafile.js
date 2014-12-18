{
	id: 'dl.colafile',
	name: '可乐盘',
	host: 'colafile.com',
	hide: [
		'.table_right', '#down_link3', '.tui', '.ad1 > .ad1 > *:not(.downbox)',

		// 计时下载页的广告
		'.hotrec-ele', '.viewshare-copy-outer'
	],
	genDigit: function () {
		return Math.ceil(Math.random() * 255);
	},
	genValidIp: function () {
		return [0,0,0,0].map(this.genDigit).join('.');
	},
	onBody: function () {
		var file_id = location.pathname.match(/\d+/)[0];

		$.ajax({
			url: '/ajax.php?action=downaddress&file_id=' + file_id,
			headers: {
				'X-Forwarded-For': this.genValidIp()
			},
			dataType: 'text'
		}).success (function (r) {
			var $dl = r.match (/downloadFile\("(.+?)"/)[1].replace('/dl.php', '/td.php');
			var linkText = H.sprintf('%s 专用下载', H.scriptName);

			// 新版
			$('<a>').addClass ('new-dbtn')
				.attr ('href', $dl)
				.append ($('<em>').addClass ('icon-download'))
				.append ($('<b>').text (linkText))
				.appendTo ($('.slide-header-funcs'));

			// 旧版
			$('<a>').addClass ('button btn-green')
				.attr ('href', $dl)
				.append ($('<i>').addClass ('icon'))
				.append (linkText)
				.appendTo ($('#down_verify_box > li'))
				.css ({
					width: 300,
					margin: '2em 0'
				});
		});
	}
}