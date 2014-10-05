{
	name: '百度盘免下载管家',
	host: ['yun.baidu.com', 'pan.baidu.com'],
	path: function () {
		return !H.beginWith (location.pathname, '/disk/home');
	},
	onStart: function () {
		Object.defineProperties (unsafeWindow.navigator, {
			platform: {
				value: 'Jixun v1.0; Powered by UserScript',
				writable: false
			}
		});
	}
}