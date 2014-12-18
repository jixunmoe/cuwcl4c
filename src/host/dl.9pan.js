{
	id: 'dl.9pan',
	name: '9盘',
	host: 'www.9pan.net',

	onStart: function () {
		if ( /\/\d/.test ( location.pathname ) ) {
			location.pathname = location.pathname.replace ('/', '/down-');
		}
	}
}