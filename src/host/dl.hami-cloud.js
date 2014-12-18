{
	id: 'dl.hami-cloud',
	name: 'Hami 个人云',
	example: 'http://webhd.xuite.net/_oops/jixun.demo/hy0',
	host: ['webhd.xuite.net', 'sync.hamicloud.net'],
	path: '/_oops/',

	onBody: function () {
		H.waitUntil('_open', function () {
			// 点广告
			unsafeWindow._open ();

			// 自动下一页
			setTimeout(function () {
				$('#share-download-func-submit')[0].click();
			}, 20);
		});

		// 等待 10s -> 2s
		unsafeExec (function () {
			$(function () {
				$('#global').data('time', 8);
			});
		});
	}
}