{
	id: 'dl.dlkoo',
	name: '大连生活网',
	example: 'http://www.dlkoo.com/down/6/2011/222686754.html',
	host: ['dlkoo.com'],
	path: '/down/downfile.asp',

	onStart: function () {
		document.write = null;

		Object.defineProperty(unsafeWindow, 'navigator', {
			set: function () {},
			get: function () {
				return null;
			}
		});
	},

	onBody: function () {
		var firstEl = document.body.children[0];
		if (!firstEl) firstEl = document.body;

		var firstTxt = firstEl.textContent;
		if (H.beginWith(firstTxt, '防盗链提示') || H.beginWith(firstTxt, '验证码')) {
			H.reDirWithRef(location.href);
			return ;
		} else if (H.beginWith(firstTxt, '防刷新')) {
			firstEl.style.whiteSpace = 'pre';
			firstEl.textContent += '\n\n请稍后, 5秒后自动刷新…';
			setTimeout(H.reDirWithRef, 5500, location.href);
			return ;
		}

		var btnDl = document.getElementById('btsubmit');
		if (btnDl) {
			btnDl.id = null;
			btnDl.value = '开始下载';
			btnDl.disabled = false;

			var fakeBtn = document.createElement('input');
			fakeBtn.id = 'btsubmit';
			$(fakeBtn).hide().appendTo('body');
		}
	}
}