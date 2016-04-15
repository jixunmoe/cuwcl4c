MODULE
/**
 * 5xfile.com
 *   五星网盘 (?)
 */
({
	id: 'dl.5xfile',
	name: '五星网盘',
	host: ['www.5xfile.com'],
	noSubHost: true,

	hide: [
		'.fb_r', 'iframe', '[id^="__"]', '#addr_box'
	],

	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});
		H.phpDiskAutoRedir ();
	},

	onBody: function () {
		var file = location.pathname.match(/\d+/);
		unsafeExec(function (fid) {
			if (typeof load_down_addr1 == 'function')
				load_down_addr1(fid);
		}, file[0]);
	}
});