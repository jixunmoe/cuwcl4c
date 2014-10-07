{
	name: '79 盘',
	host: '79pan.com',

	fullHost: 'www.79pan.com',
	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});

		H.log ('隐藏、显示必要元素');
		H.forceShow.call(H.forceHide ('#code_box', '#down_box2'), '#down_box');

		H.log ('修正网站获取下载地址');
		if (this.fullHost != location.hostname)
			location.hostname = this.fullHost;
	},
	onBody: function () {
		H.waitUntil ('down_file_link', function () {
			// 强制显示地址
			unsafeWindow.down_file_link ();

			// 然后跳过去
			location.href = $('.down_btn').attr('href');
		});
	}
}