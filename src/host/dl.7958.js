{
	id: 'dl.7958',
	name: '千军万马网盘系列',
	host: ['7958.com', 'qjwm.com'],
	hide: [
		'#downtc', '[id^="cpro_"]', '.download_alert', '#inputyzm',
		'#house', '#uptown', 'a[href$="money.html"]', 'a[href$="reg.html"]'
	],
	show: ['#downtc2', '.new_down'],
	onBody: function () {
		if (H.contains (location.pathname, 'down_')) {
			location.pathname = location.pathname.replace('_', 'load_');
		}

		H.waitUntil('authad', function () {
			unsafeDefineFunction ('authad', tFunc);
		});
	}
}