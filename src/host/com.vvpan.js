{
	name: 'VV 网盘',
	host: 'vvpan.com',
	hide: ['#code_box', '.talk_show', '.banner_2', '.w_305', '.ad'],
	show: '#down_box',

	onStart: function () {
		H.phpDiskAutoRedir ();
	}
}