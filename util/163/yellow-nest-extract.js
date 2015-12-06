console.info([].join.call($.unique($('td[name="ip"]').map(function () {
	return this.textContent.trim();
})).filter(function () {
	return this && this != '-' && this != '超时' && this != '1.1.1.1';
}), '\n'));