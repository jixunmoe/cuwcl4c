{
	name: '79 盘',
	host: '79pan.com',

	hide: ['#code_box', '#down_box2'],
	show: '#down_box',

	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});
	},
	onBody: function () {
		H.waitUntil ('down_file_link', function () {
			// 强制显示地址
			unsafeWindow.down_file_link ();
			var dlBtn = $('.down_btn')[0];
			// 激活链接
			unsafeWindow.show_down_url (dlBtn.id);

			// 然后跳过去
			H.reDirWithRef (dlBtn.href);
		});
	}
}