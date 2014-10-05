{
	name: '乐盘 [lepan.cc, sx566.com]',
	host: ['lepan.cc', 'sx566.com'],
	hide: [
		'.ad', '[class^="banner"]', '#dl_tips',
		'.content_l > .down_list_1', '.file_tip',
		'.down_list_1 > .putong:first-child', '#code_box'
	],
	show: ['#down_box'],
	onBody: function () {
		H.phpDiskAutoRedir ();
		$('#header:first').next().remove ();
	}
}