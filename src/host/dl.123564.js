{
	id: 'dl.123564',
	name: '123564 网盘',
	host: ['123564.com', 'm.123564.com'],
	noSubHost: true,

	css: '.ad1{height:1px !important}',
	hide: ['#loading', '#yzm'],
	show: '#download',
	onStart: function () {
		unsafeWindow.killpanads = 1;
	},
	onBody: function () {
		$('#download > a').click();
	}
}
