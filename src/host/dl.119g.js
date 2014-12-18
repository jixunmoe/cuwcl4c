{
	id: 'dl.119g',
	name: '119g 网盘',
	host: ['d.119g.com'],
	noSubHost: true,

	onStart: function () {
		if (H.beginWith (location.pathname, '/f/') && !H.contains (location.pathname, '_bak')) {
			location.pathname = location.pathname.replace(/(_.+)?\./, '_bak.');
		}
	}
}