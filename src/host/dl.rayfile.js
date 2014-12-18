{
	id: 'dl.rayfile',
	name: '飞速网',
	host: 'rayfile.com',
	hide: ['div.left'],

	onBody: function () {
		if (unsafeWindow.vkey) {
			location.pathname += unsafeWindow.vkey;
		} else {
			unsafeWindow.filesize = 100;
			unsafeWindow.showDownload ();
			unsafeWindow.showDownload = eFunc;
			
			$('#downloadlink').addClass('btn_downNow_zh-cn');
			$('#vodlink').addClass('btn_downTools_zh-cn');
		}
	}
}