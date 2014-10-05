{
	name: '79 盘',
	host: '79pan.com',
	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});

		H.log ('隐藏、显示必要元素');
		H.forceShow.call(H.forceHide ('#code_box', '#down_box2'), '#down_box');

		H.log ('修正网站获取下载地址');
		if (!/^www\./.test(location.hostname))
			location.hostname = H.directHost;
	},
	onBody: function () {
		H.phpDiskAutoRedir();
	}
}