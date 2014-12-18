{
	id: 'internal.config',
	name: '脚本配置页面',
	host: ['localhost', 'jixunmoe.github.io'],
	path: ['/conf/', '/cuwcl4c/config/'],

	onStart: function () {
		unsafeWindow.rScriptVersion = H.version;
		unsafeWindow.rScriptConfig  = JSON.stringify (H.config);
		H.info (H.config);

		var _c = confirm;
		document.addEventListener ('SaveConfig', function (e) {
			try {
				var config = JSON.stringify (JSON.parse (e.detail));
				if (_c (H.sprintf ('确定储存设定至 %s?', H.scriptName)))
					GM_setValue (H.scriptName, config);
			} catch (e) {
				alert ('解析设定值出错!');
			}
		});
	},
	onBody: function () {
        H.captureAria(document.body);
	}
}
