{
	name: '豆瓣电台',
	host: 'douban.fm',
	noSubHost: true,
	css: <% ~fm.douban.dl.css %>,

	// 参考代码 豆藤, USO: 49911
	onBody: function () {
		var linkDownload = $('<a>').css(H.makeDelayCss())
			.attr ('target', '_blank')
			.attr ('id', 'jx_douban_dl')
			.text ('下载');

		$('<div>')
			.attr ('id', 'jx_douban_dl_wrap')
			.append(linkDownload)
			.insertAfter('.player-wrap');
		
		H.log ('等待豆瓣电台加载 ..');
		
		H.waitUntil('extStatusHandler', function () {
			H.log ('绑定函数 ..');
			unsafeOverwriteFunctionSafeProxy ({
				extStatusHandler: function (jsonSongObj) {
					var songObj = JSON.parse(jsonSongObj);
					if ('start' == songObj.type && songObj.song) {
						linkDownload
							.attr('href', H.uri (songObj.song.url, songObj.song.title + songObj.song.url.slice(-4)))
							.attr('title', '下载: ' + songObj.song.title);
						
						H.info ('%s => %s', songObj.song.title, songObj.song.url);
					}

					throw new ErrorUnsafeSuccess ();
				}
			});

			H.log ('函数绑定完毕, Enjoy~');
			
		});
	}
}