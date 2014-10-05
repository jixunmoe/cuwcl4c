{
	name: '城通网盘系列',
	host: ['400gb.com', 'ctdisk.com', 'pipipan.com', 'bego.cc'],
	hide: ['.captcha', '.kk_xshow', 'div.span6:first-child'],

	onBody: function () {
		// Fix Anti-ABP as it doesn't check the code.
		H.waitUntil ('guestviewchkform', null, function (that) {
			return that.randcode && that.randcode.value.length == 4;
		});
		
		document.user_form.hash_key.value = H.base64Decode(document.user_form.hash_info.value);
		$('.captcha_right').css('float', 'left');
		
		$('#vfcode:first').parent()
			.append(H.createNumPad(4, $('#randcode')[0], function () {
				document.user_form.submit();
				return true;
			}));

		H.log ('城通就绪.');
	}
}