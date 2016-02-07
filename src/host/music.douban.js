MODULE
/**
 * 豆瓣音乐下载解析 By Jixun
 */
({
	id: 'music.douban',
	name: '豆瓣音乐下载解析',
	host: 'music.douban.com',
	noSubHost: true,
	noFrame: false,
	dl_icon: true,
	//-// css: <% ~com.douban.music.css %>,

	onBody: function () {
		var $btnDownload = $('<a>').attr('id', 'btn-download');
		$('<i>').addClass('jx_dl jx_btn').appendTo($btnDownload);
		H.captureAria($btnDownload);

		function inject_dl_icon () {
			$btnDownload.prependTo('.container .mod2');
		}

		function handle_url (song) {
			var url = H.uri(song.get('url'), song.get('title') + " [" + song.get('artist_name') + "].mp3");
			$btnDownload.attr('href', url);
		}

		exportFunction(handle_url, unsafeWindow, {
			defineAs: "dl_jixun"
		});

		exportFunction(inject_dl_icon, unsafeWindow, {
			defineAs: "init_jixun"
		});

		unsafeExec(function () {
			require(['player/app', 'player/models/song', 'player/views/playinfo'], function (App, Song, PlayInfo) {
				setTimeout(init_jixun, 25);

				var sp = Song.prototype.startPlaying;
				Song.prototype.startPlaying = function () {
					dl_jixun(this);
					return sp.apply(this, arguments);
				};

				var pir = PlayInfo.prototype.render;
				PlayInfo.prototype.render = function () {
					var r = pir.apply(this, arguments);
					init_jixun();
					return r;
				};
			});
		});
	}
});