{
	id: 'cc.lepan',
	name: '乐盘自动下载地址',
	host: ['www.lepan.cc', 'www.sx566.com'],
	noSubHost: true,
	hide: '.widget-box',
	onStart: function () {
		// 破坏广告
		Object.defineProperty(unsafeWindow, 'google', {
			set: function () { },
			get: function () { throw new Error(); }
		});
		
		H.rule.exec('phpdisk.z', 'onStart');
	},
	onBody: function () {
		$('.widget-box:eq(0)').removeClass('widget-box');
	}
}