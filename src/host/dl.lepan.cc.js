{
	id: 'cc.lepan',
	name: '乐盘自动下载地址',
	host: 'www.lepan.cc',
	noSubHost: true,
	hide: '.widget-box',
	onStart: function () {
		H.rule.exec('phpdisk.z', 'onStart');
	},
	onBody: function () {
		$('.widget-box:eq(0)').removeClass('widget-box');
	}
}