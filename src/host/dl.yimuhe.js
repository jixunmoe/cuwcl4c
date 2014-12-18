{
	id: 'dl.yimuhe',
	name: '一木禾网盘',
	host: 'yimuhe.com',

	hide: ['#loading', '.ggao', '.kuan'],
	show: ['#yzm'],

	onStart: function () {
		H.phpDiskAutoRedir();
	},

	onBody: function () {
		if (H.beginWith ( location.pathname, '/n_dd.php' )) {
			H.reDirWithRef($('#downs').attr('href'));
			return ;
		}

		var dlContainer = document.getElementById ('download');
		if (!dlContainer) return ;

		// 当下载框的 style 属性被更改后, 模拟下载按钮单击.
		var mo = new MutationObserver (function () {
			$('a', dlContainer)[1].click();
		});
		mo.observe (dlContainer, { attributes: true });

		$('#yzm>form')
			.append(H.createNumPad(4, '#code', function () {
				document.yzcode.Submit.click();
				return true;
			}, function () {
				$('#vcode_img')[0].click();
			}));
	}
}