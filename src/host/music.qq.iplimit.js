MODULE({
	id: 'music.qq.iplimit',
	name: 'QQ 音乐、电台海外访问限制解除',
	host: ['y.qq.com', 'i.y.qq.com', 'fm.qq.com'],
	onStart: function () {
		// MV 页面解锁
		if (document.cookie.indexOf('ip_limit=1') == -1) {
			document.cookie = 'ip_limit = 1; expires=' + (new Date('2099/01/01')).toGMTString() + "; domain=.qq.com;";
		}
	},
	onBody: function () {
		H.info ('等候海外访问限制模组加载…');
		H.waitUntil ('MUSIC.widget.main.IP_limit.isLimit', function () {
			H.info ('海外访问限制解除.');
			unsafeOverwriteFunction ({
				// 解除「QQ音乐暂时不能对您所在的国家或地区提供服务」限制
				isLimit: function () {}
			}, unsafeWindow.MUSIC.widget.main.IP_limit, '.MUSIC.widget.main.IP_limit');
		});
	}
});