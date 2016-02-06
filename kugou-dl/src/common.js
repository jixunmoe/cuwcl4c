(function () {
	var lstSizes = ' KMG';
	Vue.filter('size', function (value) {
		var i = 0;
		while (value >= 1024) {
			value /= 1024;
			i++;
		}

		return parseFloat(value.toFixed(2)) + lstSizes[i] + 'b';
	});

	Vue.filter('quality', function (value) {
		if (value <= 128) {
			return '标准音质';
		} else if (value <= 320) {
			return '高品音质';
		} else {
			return '高爆音质';
		}
	});
})();