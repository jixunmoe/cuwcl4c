{
	id: 'dl.namipan',
	name: '87盘 [现 namipan.cc]',
	host: ['namipan.cc'],
	onStart: function () {
		if (H.beginWith (location.pathname, '/file/'))
			location.pathname = '/download/' + location.pathname.match(/\d+/) + '.html';
	}
}