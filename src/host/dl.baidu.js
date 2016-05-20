{
	id: 'dl.baidu',
	name: '百度盘免下载管家',
	host: ['yun.baidu.com', 'pan.baidu.com'],

	onBody: function () {
		H.waitUntil ('require', function () {
			unsafeExec (function () {
				var service = require('disk-system:widget/plugin/download/util/downloadCommonUtil.js');
				service.isPlatformWindows = function () { return false; };
			});
		});
	}
}