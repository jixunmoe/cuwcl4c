{
	id: 'phpdisk.z',
	name: '通用 phpDisk.z 网盘规则',
	// 规则: 直接跳转 /file-xxx -> /down-xxx
	//       并隐藏 down_box2, 显示 down_box
	
	host: [
		'azpan.com', 'gxdisk.com', '2kuai.com', '1wp.me', 
		'77pan.cc', 'vvpan.com', 'fmdisk.com', 'bx0635.com',
		'10pan.cc'
	],
	hide: [
		// azpan, gxdisk
		'.Downpagebox',

		'.talk_show', '.banner_2', '.w_305',

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