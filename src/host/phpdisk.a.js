{
	id: 'phpdisk.a',
	name: '通用 phpDisk.a 网盘规则',
	// 相关规则: 跳转 /file-xxx -> /download.php?id=xxx&key=xxx
	
	host: [
		'79pan.com', '7mv.cc', 'pan.52zz.org', '258pan.com',
		'huimeiku.com', 'wpan.cc', 'lepan.cc', 'sx566.com'
	],

	hide: ['#code_box', '#down_box2', '#codefrm', '.ad', '[class^="banner"]'],
	show: '#down_box',

	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});
	},
	onBody: function () {
		H.waitUntil ('down_file_link', function () {
			// 避免地址被覆盖
			unsafeWindow.update_sec = null;
			// 强制显示地址
			unsafeWindow.down_file_link ();

			// 强制显示下载地址
			if (unsafeWindow.show_down_url)
				unsafeWindow.show_down_url ('down_a1');

			var jumpUrl = $('#down_link').find('a').attr('href');

			// 然后跳过去
			if (jumpUrl) {
				H.reDirWithRef (jumpUrl);
			} else {
				alert (H.sprintf('[%s]: 应用 %s 失败:\n找不到跳转地址.', H.scriptName, this.name));
			}
		});
	}
}