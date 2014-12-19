{
	id: 'music.baidu.play',
	name: '百度音乐盒',
	host: 'play.baidu.com',
	path: '/',

	show: '#floatBtn>.lossless',

	// jQuery 的 width 计算在火狐下会包括样式表, 即使元素已经不在 body 里…
	css:  '.column4{width:0 !important}',

	// 单曲解析只有这些
	qualities: 'auto_1 mp3_320+_1 mp3_320_1'.split(' '),

	/**
	 * @private
	 * 初始化事件绑定
	 */
	initEvents: function () {
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
	},

	/**
	 * 错误数据
	 * @type {Object}
	 */
	ERROR: {
		'22232': {
			text: '请挂上*大陆*马甲, 因其它地区访问被屏蔽.\n\n如果您会使用相关插件, 请加入下述地址至规则:  \nhttp://music.baidu.com/data/user/collect?*  \n\n您可以按下 Ctrl+C 拷贝该消息.',
			level: 'error',
			alert: true
		},
		'22322': {
			text: '已经在收藏列表, 不移除.',
			level: 'info'
		},
		'22331': {
			text: '云端收藏已满, 请先腾出位置!',
			level: 'warn',
			alert: true
		},
		'22000': {
			text: '因下载解析而添加至收藏, 解析后移除链接.',
			level: 'info'
		}
	},

	/**
	 * 提取错误信息
	 * @param  {Integer} errCode 错误代码
	 * @return {Object}          错误信息详细
	 */
	error: function (errCode) {
		var errInfo = this.ERROR[errCode.toString()] || {
			text: '未知错误: ' + errCode,
			alert: true,
			level: 'warn'
		};
		errInfo.code = parseInt(errCode, 10);

		H[errInfo.level](errInfo.text);

		if (errInfo.alert)
			alert( errInfo.text );

		return errInfo;
	},

	/**
	 * @private
	 * 拦截播放器下载事件
	 */
	hookPlayerDownload: function () {
		var that = this;

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
							isFlac:     !!isFlac,
							inFav:      !!e.hasCollected
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

	/**
	 * @private
	 * document-start 回调
	 */
	onStart: function () {
		this.initEvents ();
		this.hookPlayerDownload ();
	},

	/**
	 * 提交 Post 请求
	 * @param  {Request} req   请求对象, 参见 GM_xmlhttpRequest
	 * @return {Object}        xmlhttpRequest 对象
	 */
	post: function (req) {
		req.method = 'POST';
		req.headers = req.headers || {};
		req.headers.Referer = req.headers.Referer || 'http://music.baidu.com/';
		req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		req.data = $.param(req.data);

		return GM_xmlhttpRequest(req);
	},

	/**
	 * @private
	 * 播放器下方的下载事件接管
	 * @param  {Event} e   事件
	 */
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

	/**
	 * 随机数
	 * @return {String} 随机数
	 */
	_rnd: function () {
		return Math.random().toString().slice(2);
	},

	/**
	 * 解析百度返回的不规则数据
	 * @param  {Response} r   GM_xmlhttpRequest.onload 回调的参数 1
	 * @return {Object}       相关数据
	 */
	_parseRaw: function (r) {
		return JSON.parse(r.responseText.replace(/\s/g, ''));
	},

	/**
	 * 解析百度返回的不规则数据的 data 节点
	 * @param  {Response} r   GM_xmlhttpRequest.onload 回调的参数 1
	 * @return {Object}       相关数据
	 */
	_parse: function (r) {
		return this._parseRaw(r).data;
	},

	/**
	 * 取歌曲是否在收藏里面, 是的话则能直接解析
	 * @param  {Integer}   songId 曲目 ID
	 * @param  {Function}  cbDone 回调, 1 参数, Boolean 是否在收藏夹
	 * @return {Boolean}        [description]
	 */
	_isFav: function (songId, cbDone) {
		var self = this;
		GM_xmlhttpRequest ({
			method: 'GET',
			url: H.sprintf('http://music.baidu.com/data/user/isCollect?type=song&ids=%s&r=%s', songId, this._rnd()),
			onload: function (r) {
				cbDone(!!self._parse(r).isCollect);
			}
		});
	},

	/**
	 * 加入收藏夹
	 * @param {Integer}  songId 曲目 ID
	 * @param {Function} cbDone 回调错误信息
	 */
	_addFav: function (songId, cbDone) {
		var self = this;
		this.post({
			url: 'http://music.baidu.com/data/user/collect?r=' + this._rnd(),
			data: {
				ids: songId,
				type: 'song',
				pay_type: 0
			},
			onload: function (r) {
				cbDone(self.error(self._parseRaw(r).errorCode));
			}
		});
	},

	/**
	 * 移除收藏夹
	 * @param {Integer}  songId 曲目 ID
	 * @param {Function} cbDone 回调错误信息
	 */
	_rmFav: function (songId, cbDone) {
		var self = this;
		this.post({
			url: 'http://music.baidu.com/data/user/deleteCollection?r=' + this._rnd(),
			data: {
				ids: songId,
				type: 'song',
				pay_type: 0
			},
			onload: function (r) {
				cbDone(self.error(self._parseRaw(r).errorCode));
			}
		});
	},

	/**
	 * 直接获取曲目信息, 请确保用户有权限直接解析或在收藏夹内.
	 * @param  {Integer}  songId   曲目 ID
	 * @param  {Function} cbSong   回调
	 */
	_getSongInfoDirect: function (songId, cbSong) {
		var self = this;
		GM_xmlhttpRequest ({
			method: 'GET',
			url: 'http://yinyueyun.baidu.com/data/cloud/download?songIds=' + songId,
			onload: function (r) {
				cbSong(self._parse(r).data);
			}
		});
	},

	/**
	 * 获取曲目信息
	 * @param  {Integer}  songId 曲目 ID
	 * @param  {Function} cbSong 回调
	 */
	_getSongInfo: function (songId, cbSong) {
		var self = this;
		this._addFav(songId, function (errInfo) {
			if (errInfo.level == 'error') {
				H.error('添加收藏夹出错, 取消操作.');
				return ;
			}

			var isFav = errInfo.code === 22000;
			var qRemoveFav = $.Deferred();
			qRemoveFav.success(isFav ? H.nop : function () {
				H.info ('移除为解析而临时添加的歌曲… %s', songId);
				self._rmFav(songId);
			});

			self._getSongInfoDirect(songId, function (r) {
				cbSong(r, qRemoveFav.resolve.bind(qRemoveFav));
			});
		});
	},

	/**
	 * 根据基本信息构建下载地址
	 * @param  {Integer} songId      曲目 ID
	 * @param  {Integer} songRate    码率, 单位为 kbps
	 * @param  {String}  musicFormat 音乐文件格式
	 * @return {String}              构建的文件地址, 需要 Cookie
	 */
	_buildUrl: function (songId, songRate, musicFormat) {
		return H.sprintf(
			'http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds=%s&rate=%s&format=%s',
			songId, songRate, musicFormat
		);
	},

	/**
	 * 构建无需附加数据的下载地址
	 * @param  {String}   url   会跳转的地址
	 * @param  {Function} cbUrl 回调, 1 参数, String 真实地址
	 */
	_getRealUrl: function (url, cbUrl) {
		GM_xmlhttpRequest ({
			method: 'GET',
			url: url,
			headers: {
				Range: 'bytes=0-1'
			},
			onload: function (r) {
				cbUrl (r.finalUrl);
			}
		});
	},

	/**
	 * 选择最高码率
	 * @param  {Object} dl   带有码率数据的对象
	 * @return {Object}      最高的码率对象
	 */
	_getBestQuality: function (dl) {
		var qu = Object.keys(dl).sort(function (a, b) {
			if (!dl[a]) return dl[b] ? -1 : 0;
			if (!dl[b]) return  1;
			return dl[a].rate - dl[b].rate;
		}).pop();

		return dl[qu];
	},

	_renameUrl: function (oldUrl, file) {
		//    /12345/xxx.mp3?yyy -> /12345/file.mp3?yyy
		return oldUrl.replace(/(\/\d+\/).+\?/, '$1' + file + '?');
	},

	/**
	 * @private
	 * 批量下载处理的回调函数
	 * @param  {Function} next    回调, 当前项目处理完毕后调用
	 * @param  {Object}   objSong 曲目信息
	 */
	_batch: function (next, objSong) {
		var self = this;

		// 检查是否需要临时加入收藏夹
		var getSongInfoType = objSong.isFav ? '_getSongInfoDirect' : '_getSongInfo';
		this[getSongInfoType] (objSong.songId, function (dl, cbRemoveFav) {
			// 除非选择下无损 否则不采用无损
			if (!objSong.isFlac && dl.flac)
				delete dl.flac;

			var songDl = self._getBestQuality(dl);
			var file = H.sprintf('%s [%s].%s', objSong.songName, objSong.artistName, songDl.format);

			self._getRealUrl (self._buildUrl(objSong.songId, songDl.rate, songDl.format), function (url) {
				// 移除临时用的收藏夹, 不占位
				if (cbRemoveFav)
					cbRemoveFav ();

				H.addDownload (self._renameUrl(url), file);
				next ();
			});
		});
	},

	/**
	 * @private
	 * 批量下载事件接管函数
	 * @param  {Event} e   事件
	 */
	_batchDownload: function (e) {
		var arrSongs = JSON.parse (e.detail);
		var $q = this.$q;

		$q.add.apply($q, arrSongs);
	}
}