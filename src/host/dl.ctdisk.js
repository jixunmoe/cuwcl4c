{
	id: 'dl.ctdisk',
	name: '城通网盘系列',
	host: [
		'400gb.com', 'ctdisk.com', 'pipipan.com', 'bego.cc',
		'ctfile.com', 't00y.com'
	],
	path: '/file/',
	hide: ['.captcha', '.kk_xshow', 'div.span6:first-child', '#top > .alert'],

	onBody: function () {
		// Fix Anti-ABP as it doesn't check the code.
		H.waitUntil ('guestviewchkform', function () {
			unsafeExec(function () {
				window.guestviewchkform = function (form) {
					return form.randcode && form.randcode.value.length == 4;
				};
			});
		});

		var keyForm = document.user_form;
		var $kf = $(keyForm);
		
		try {
			keyForm.hash_key.value = H.base64Decode(keyForm.hash_info.value);
		} catch (e) {
			H.info ('缺失或无效的 hash_key 属性值, 跳过…');
		}

		$kf.attr('action', $kf.attr('action').replace(/(V)\d/i, '$12'));

		$('.captcha_right').css('float', 'left');
		
		/* 城通现在的验证码是混合数字、字母
		$('#vfcode:first').parent()
			.append(H.createNumPad(4, $('#randcode')[0], function () {
				$kf.submit();
				return true;
			}));
		*/

		$('#page_content')
			.attr('id', '^_^')
			.val('cproIframeu12581302|httpubmcmmbaidustaticcomcpromediasmallpng');

		H.log ('城通就绪.');
	}
}