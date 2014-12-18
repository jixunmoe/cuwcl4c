{
	id: 'dl.baidu',
	name: '百度盘免下载管家',
	host: ['yun.baidu.com', 'pan.baidu.com'],

	onBody: function () {
		H.waitUntil ('require', function () {
			unsafeExec (function () {
				var service = require ('common:widget/commonService/commonService.js');
				service.getWidgets ('common:widget/downloadManager/service/downloadCommonUtil.js', function (util) {
					util.isPlatformWindows = function () { return false; };
				});
			});
		});
	}
}