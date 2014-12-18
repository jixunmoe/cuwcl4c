{
	id: 'music.songtaste',
	name: 'SongTaste 下载解析',
	host: ['songtaste.com'],

	onBody: function () {
		var path = location.pathname;
		if (H.beginWith (path, '/album/') || H.beginWith (path, '/music/')) {
			this.album ();
		} else if (H.beginWith (path, '/song/')) {
			this.single ();
		} else if (H.beginWith (path, '/playmusic.php')) {
			this.playlist ();
		}
	},


	album: function () {
		H.log ('ST :: 专辑页面调整');
		var btn_playAll = $($('.song_fun_btn').children()[1]);
		var btn_noPopPlay = btn_playAll.clone().attr({
			'value': '当前窗口播放',
			'onclick': ''
		}).insertAfter (btn_playAll);

		btn_noPopPlay.click(function () {
			var ids = [].filter.call (unsafeWindow.chkArray, function (e) {
				return e.checked;
			}).map (function (e) {
				return e.value;
			}).join(',');

			if (!ids) {
				ids = [].map.call(unsafeWindow.chkArray, function (e) {
					return e.value;
				}).join (',');
			}

			location.href = '/playmusic.php?song_id=' + ids;
		});
	},

	single: function () {
		var args    = $("#playicon a").attr('href').replace(/\s/g, '').replace(/"/g, "'").split("'");
		var sURL    = args [05],
			sType   = args [11],
			sHead   = args [13],
			songId  = args [15],
			sLength = args [16].match (/\d{2,}/)[0];

		var q = $.Deferred();
		q.then (function (songUrl) {
			H.log ('ST :: 解析音乐地址 :: %s', songUrl);
			var songName = $('.mid_tit').text();

			$('a#custom_1').attr({
				'href': H.uri(songUrl, songName + songUrl.slice(-4)),
				'title': '下载: ' + songName
			}).text('直接下载');
		});

		if (H.contains(sURL, 'rayfile')) {
			q.resolve (sHead + sURL + unsafeWindow.GetSongType(sType));
		} else {
			$.ajax({
				type: 'POST',
				url: '/time.php',
				cache: true,
				data: 'str=' + sURL + '&sid=' + songId + '&t=' + sLength,
				dataType: 'text',
			}).success(function (r) {
				q.resolve (r);
			});
		}
	},

	playlist: function () {
		// 下载解析 - Hook 更换歌曲的函数，避免重复读取歌曲 + 不需要多次请求服务器不容易掉线。
		H.log ('ST :: 列表模式解析');

		var pDownload = $('#left_music_div > .p_fun > a:last')
			.text('直接下载')
			.attr('target', '_blank');

		unsafeOverwriteFunctionSafeProxy ({
			changeSong: function (name, url, isLogoShown) {
				// 2013.03.19 & 2013.04.09 修正:
				//   已经删除的歌曲自动跳到下一曲
				if ( 0 == name.trim().length ) {
					unsafeWindow.pu.doPlayNext(2);
					return;
				}
				H.log ('请求歌曲 :: %s :: %s', name, url);
				pDownload.attr({
					'href': H.uri(url, name + url.slice(-4)),
					'title': '下载: ' + name
				});
				document.title = 'ST - ' + name;

				// 转接给原函数
				throw new ErrorUnsafeSuccess();
			},

			delSongDiv: function (songid, isbox) {
				H.log ('删除歌曲 :: ' + songid.toString());
				$('#' + songid).hide();

				var new_songlist = [];
				for (var i = 0; i < unsafeWindow.arr_ids.length; i++) {
					if (unsafeWindow.arr_ids[i] == songid) {
						if (songid == unsafeWindow.cur_sid)
							unsafeWindow.pu.doPlayNext(1);
						unsafeWindow.arr_ids[i] = 0;
					}
				}
			}
		});

		// 2013.03.19 添加:
		//   重建播放列表地址
		$('p.p_list_txt').append($('<a>').text('重建播放列表').click(function () {
			location.search = '?song_id=' + unsafeWindow.arr_ids.join(',');
		}).css('cursor', 'pointer'));
		
		H.log ('ST :: 等待网页加载...');
		H.waitUntil ('pu.doPlayNext', function () {
			H.log ('ST :: 官方播放器删除功能修正启动');

			unsafeOverwriteFunctionSafeProxy ({
				doPlayNext: function (t) {
					var now, avl, i;
					for (i = 0; i < unsafeWindow.arr_ids.length; i++) {
						if (unsafeWindow.arr_ids[i] == unsafeWindow.cur_sid) {
							now = i;
							break;
						}
					}
					// 寻找下一首未删除的歌曲。
					//   * 2013.01.29 修正
					//	 1. 上一首查找失败的情况下会滚回到当前音乐的错误。
					//	 2. 如果没有可听歌曲情况下无限循环的错误。
					
					now = Math.abs((now || 0) + t);
					avl = 0;
					
					// 检查是否有歌曲剩余
					for (i = 0; i < unsafeWindow.arr_ids.length; i++) {
						if (unsafeWindow.arr_ids[i]) {
							avl++;
						}
					}
					if (avl === 0) {
						alert('歌都被删光了还听啥...');
						return;
					}
					
					// 寻找空位
					while (true) {
						if (unsafeWindow.arr_ids[now]) {
							H.log ('切换歌曲 :: ' + now.toString());
							unsafeWindow.pu.utils(now);
							unsafeWindow.cur_sid = unsafeWindow.arr_ids[now];
							unsafeWindow.playSongRight();
							return;
						}
						now += t >= 0 ? 1 : -1;
						if (unsafeWindow.arr_ids.length <= now) {
							now = 0;
						}
						if (now < 0) {
							now = unsafeWindow.arr_ids.length;
						}
					}
				}
			}, unsafeWindow.pu, '.pu');
		});
	}
}