{
	id: 'music.baidu.play',
	name: '百度音乐盒',
	host: 'play.baidu.com',
	path: '/',

	show: '#floatBtn>.lossless',

	// jQuery 的 width 计算在火狐下会包括样式表, 即使元素已经不在 body 里…
	css:  '.column4{width:0 !important}',

	onStart: function () {
		var that = this;
		this.qualities = 'auto_1 mp3_320+_1 mp3_320_1'.split(' ');
		this.isAria = H.config.dUriType == 2;

		// Batch download queue
		H.setupAria ();
		this.$q = new IntervalLoop([], this._batch.bind(this), 300);
		this.$q.loop(); // 准备接收数据
		document.addEventListener (H.scriptName + '-BATCH', this._batchDownload.bind (this), false);

		if (!this.isAria) {
			H.warn ('批量下载仅支援 Aria2 模式!');
		}

		document.addEventListener (H.scriptName, this._recvEvent.bind (this), false);

		// fmPlayerView 是最后一个
		H.waitUntil ('fmPlayerView', function () {
			that.$dlBtn = $('.main-panel .download > a');

			unsafeExec(function (scriptName, hookBatch) {
				// 黄金 VIP
				var oldSetVip = HQ.model.setVipInfo;
				HQ.model.setVipInfo = function ( isVip, z ) {
					if (!isVip) {
						isVip = true;
					}

					return oldSetVip.call (this, isVip, z);
				};
				HQ.model.isGold = function () { return true; };
				HQ.model.setVipInfo ();

				var bakExtractUserInfo = UserModel.prototype._getUserInfo;
				UserModel.prototype._getUserInfo = function () {
					var r = bakExtractUserInfo.apply(this, arguments);
					if (!r.vip) {
						r.vip = {
							cloud: {
								service_level: 'gold'
							}
						};
					}
					r.isShowSourceIcon = false;

					return r;
				};

				// 屏蔽日志发送, 刷屏好烦
				logCtrl.sendLog = function () {};

				var instFloatBtn = listView.tip.data("ui-floatButton");
				var oldMusicDownload = listView.download;
				listView.download = function (songIndex, isFlac) {
					// 批量下载, 但是不是 Aria 模式则放弃
					if (!hookBatch && songIndex.length > 1) {
						return oldMusicDownload.apply(this, arguments);
					}
					var songData = instFloatBtn.listElem.reelList("option", "data").filter(function (e, i) {
						return -1 !== songIndex.indexOf(i)
					}).map (function (e) {
						return {
							songName:   e.songName,
							artistName: e.artistName,
							songId:     e.songId,
							isFlac:     !!isFlac
						};
					});

					document.dispatchEvent (new CustomEvent (scriptName + '-BATCH', { detail: JSON.stringify(songData) }));
				};

				(function () {
					// 取消下载按钮点击
					this.$title.find('.download').off('click');

					// 绑定播放事件
					this.listCtrl.on('change:songLink', function (z, songData) {
						document.dispatchEvent (new CustomEvent (scriptName, {detail: JSON.stringify (songData)}));
					});
				}).call (window.songInfoView);
			}, H.scriptName, this.isAria);
		});
	},

	_recvEvent: function (e) {
		var songData = JSON.parse (e.detail);

		for (var i = 3/* this.qualities.length */, song; !song && i--; )
			song = songData.links[this.qualities[i]];

		// 获取歌曲失败
		if (!song || !song.songLink) {
			H.warn ('解析下载地址失败, 可能百度更新了获取方式.');
			return ;
		}

		this.$dlBtn.attr ({
			title: song.songName,
			href: H.uri(song.songLink, H.sprintf('%s [%s].%s', songData.songName, songData.artistName, song.format))
		});
	},

	_batch: function (next, objSong) {
		var that = this;

		GM_xmlhttpRequest ({
			method: 'GET',
			url: 'http://yinyueyun.baidu.com/data/cloud/download?songIds=' + objSong.songId,
			onload: function (r) {
				// 智能选取当前最高码率
				var dl = JSON.parse(r.responseText.replace(/\s/g, '')).data.data;

				// 除非选择下无损 否则不采用无损
				if (!objSong.isFlac && dl.flac)
					delete dl.flac;

				var qu = Object.keys(dl).sort(function (a, b) {
					if (!dl[a]) return dl[b] ? -1 : 0;
					if (!dl[b]) return  1;
					return dl[a].rate - dl[b].rate;
				}).pop();

				var songDl = dl[qu];
				var url = H.sprintf(
					'http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds=%s&rate=%s&format=%s',
					objSong.songId, songDl.rate, songDl.format
				);

				var file = H.sprintf('%s [%s].%s', objSong.songName, objSong.artistName, songDl.format);

				// 解析不需要 Cookie 下载的地址
				GM_xmlhttpRequest ({
					method: 'GET',
					url: url,
					headers: {
						// 不用在浏览器处理下载, 取出第一个字节就行
						Range: 'bytes=0-1'
					},
					onload: function (r) {
						// 虽然因为编码问题导致 finalUrl 的文件名部分乱码,
						// 但是识别歌曲用的 id 和 xcode 没有乱
						if (that.isAria) {
							H.addToAria(r.finalUrl, file);
						} else {
							// 不是 Aria, 弹出链接
							// 修正下链接名
							GM_openInTab (H.uri(r.finalUrl.replace(/(\/\d+\/).+\?/, '$1' + file + '?'), file), true);
						}
						next ();
					}
				});
			}
		});
	},

	_batchDownload: function (e) {
		var arrSongs = JSON.parse (e.detail);
		var $q = this.$q;

		$q.add.apply($q, arrSongs);
	}
}