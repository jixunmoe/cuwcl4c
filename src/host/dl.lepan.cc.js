{
	id: 'cc.lepan',
	name: '乐盘自动下载地址',
	host: ['www.lepan.cc', 'www.sx566.com'],
	noSubHost: true,
	show: '#down_box',
	hide: ['.widget-box', 'a[href="vip.php"]'],
	onStart: function () {
		// 破坏广告
		Object.defineProperty(unsafeWindow, 'google', {
			set: function () { },
			get: function () { throw new Error(); }
		});
		
		H.rule.exec('phpdisk.z', 'onStart');
	},
	onBody: function () {
		$('#down_box .widget-box').removeClass('widget-box');
	}
}