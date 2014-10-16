{
	name: '通用 phpDisk 网盘规则',
	host: ['azpan.com', 'gxdisk.com', '2kuai.com', '1wp.me'],
	hide: [
		// azpan, gxdisk
		'.Downpagebox',

		// 2kuai.com
		'.ad', '#vcode', '#tui', '.dcode', '#down_box2', '#dl_tips', '.nal', '.scbar_hot_td', '#incode'
	],
	show: [
		// 2kuai.com
		'#down_box', '#dl_addr'
	],
	onStart: function () {
		unsafeDefineFunction ('down_process', tFunc);
		H.phpDiskAutoRedir ();
	}
}