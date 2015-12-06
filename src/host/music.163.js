MODULE
/**
 * 网易音乐下载解析 By Jixun
 *  —— 受夠了 Coffee Script 了
 */
({
	id: 'music.163',
	name: '网易音乐下载解析',
	host: 'music.163.com',
	noSubHost: true,
	noFrame: false,
	dl_icon: true,
	//-// css: <% ~com.163.music.dl.css %>,
	onStart: function () {
		if (H.config.bInternational)
			this.generateCdn();

		this.regPlayer();

		unsafeExec(function () {
			// 优先使用 HTML5 播放器
			// 如果没有再考虑 Flash 支援
			
			// 感觉并没有什么卵用了?
			var fakePlatForm = navigator.platform + "--Fake-mac";
			Object.defineProperty(navigator, "platform", {
				get: function(){ return fakePlatForm; },
				set: function(){}
			});


			// 順便, 解鎖全球限制
			window.GRestrictive = false;
		});
	},

	generateCdn: function () {
		var cdns = [];
		var cdnList = {
			// 山东电信
			'14.215.9': [16, 43],

			// 北京电信
			'203.130.59': [6, 12]
		};

		for (var subnet in cdnList) {
			var ip_range = cdnList[subnet];
			for (var x = ip_range[0]; x <= ip_range[1]; x++) {
				cdns.push(subnet + '.' + x);
			}
		}

		this.cdn_ip = H.shuffle(cdns);
	},

	/**
	 * 移除網站的限制
	 */
	_doRemoval: function () {
		var self = this;
		H.waitUntil('nm.x', function () {
			var CR1 = self.searchFunction(unsafeWindow.nej.e, 'nej.e', '.dataset;if');
			var CR2 = self.searchFunction(unsafeWindow.nm.x, 'nm.x',  '.copyrightId==');

			// CR2 位置的內容在 CR1 函數后加載
			H.waitUntil('nm.x.' + CR2, function () {
				unsafeExec(function (bIsFrame, CR1, CR2) {
					var _CR1 = nej.e[CR1];
					nej.e[CR1] = function (z, name) {
						if (name == 'copyright' || name == 'resCopyright') {
							return 1;
						}

						return _CR1.apply(this, arguments);
					};

					nm.x[CR2]= function () {
						return false;
					};


				}, H.isFrame, CR1, CR2);
			}, 7000, 500);
		});
	},

	searchFunction: function(base, name, key) {
		for (var baseName in base) {
			var fn = base[baseName];
			if (fn && typeof fn === 'function') {
				if (fn.toString().indexOf(key) !== -1) {
					H.info('Search %s, found: %s.%s', key, name, baseName);
					return baseName;
				}
			}
		}
		H.info('Search %s, found nothing.', key);
		return null;
	},

	/**
	 * 註冊下載事件
	 * @return {[type]} [description]
	 */
	regPlayer: function () {
		var self = this;
		document.addEventListener(H.scriptName, function(e) {
				var songObj;
				songObj = e.detail;
				self.linkDownload.attr({
					href: H.uri(self.getUri(JSON.parse(songObj.song)), songObj.name + " [" + songObj.artist + "].mp3"),
					title: '下载: ' + songObj.name
				});
		});
	},

	hookPlayer: function () {
		var self = this;

		// 从播放器 Hook 改为远端 Hook
		// 因为现在每次播放都会请求一次网络
		H.waitUntil('nej.j', function () {
			var hookName = self.searchFunction(unsafeWindow.nej.j, 'nej.j', '.replace("api","weapi');

			unsafeExec(function(scriptName, hookName, bInternational, cdn_ip) {
				var QUEUE_KEY = "track-queue-cache";

				// 建立缓存
				var _cache = {};

				/**
				 * 重载缓存，防止用户开启两个标签页导致曲目缓存不同步。
				 * @return {[type]} [description]
				 */
				function reloadCache () {
					try {
						_cache = JSON.parse(localStorage[QUEUE_KEY]);
					} catch (err) {
						localStorage[QUEUE_KEY] = '{}';
					}
				}

				/**
				 * 抽取一个随机 CDN 服务器
				 * @return {[type]} [description]
				 */
				function randomCDN () {
					var ip = cdn_ip[~~(Math.random() * cdn_ip.length)];
					return 'http://' + ip + '/';
				}

				/**
				 * 储存缓存至 localStorage
				 * @return {[type]} [description]
				 */
				function saveCache () {
					localStorage[QUEUE_KEY] = JSON.stringify(_cache);
				}

				var _need_reload = true;
				window.addEventListener('storage', function (e) {
					if (e.key == QUEUE_KEY) {
						_need_reload = true;
					}
				}, false);

				function checkAndReload () {
					if (_need_reload)
						reloadCache();
				}

				/**
				 * 克隆一份对象
				 * @param  {Object} obj 对象
				 * @return {Object}     克隆后的对象
				 */
				function rebuild_object (obj) {
					return JSON.parse(JSON.stringify(obj));
				}

				/**
				 * 将曲目全部转换为黄易播放器能识别的格式。
				 * @param  {Array} songs 曲目列表
				 * @return {Object}      流量模拟
				 */
				function songs_to_data (songs) {
					var songObj = songs[0];
					var eveSongObj = {
						artist: songObj.artists.map(function(artist) {
							return artist.name;
						}).join('、'),
						name: songObj.name,
						song: JSON.stringify(songObj)
					};

					document.dispatchEvent(new CustomEvent(scriptName, {
						detail: eveSongObj
					}));

					return {
						code: 200,
						data: songs.map(function (song) {
							var song_obj = rebuild_object(song);
							if (bInternational) {
								song_obj.mp3Url = song_obj.mp3Url.replace('//m', '//p');
								// song_obj.mp3Url = song_obj.mp3Url.replace('http://', randomCDN());
							}
							song_obj.url = song_obj.mp3Url;
							song_obj.expi = 1e13;
							return song_obj;
						})
					};
				}

				var ajax = nej.j[hookName];
				function ajaxPatch (url, params) {

					if (url == '/api/song/enhance/player/url') {
						url = '/api/song/detail/';

						if (params.query.br)
							delete params.query.br;

						// 检查缓存, 减少流量
						var _ids = JSON.parse(params.query.ids);
						var _req_ids = [];
						checkAndReload();
						_ids = _ids.map(function (id) {
							if (id in _cache) {
								return _cache[id];
							}

							_req_ids.push(id);
							return id;
						});

						if (_req_ids.length === 0) {
							// 直接返回我们的缓存数据
							console.info('[%s][INFO] Load from cache: ', scriptName, params.query.ids);
							setTimeout(params.onload, 1, songs_to_data(_ids));
							return ;
						}

						// 缺少数据, 请求服务器
						console.info('[%s][INFO] Request from server: ', scriptName, _req_ids);
						params.query.ids = JSON.stringify(_req_ids);

						// 把 onload 缓存我们的函数，方便缓存。
						var _onload = params.onload;
						params.onload = function (data) {
							// 首先重新加载缓存, 防止冲突
							checkAndReload();

							// 拼接数据至缓存
							data.songs.forEach(function (song) {
								var i = _ids.indexOf(song.id);

								if (i == -1) { debugger; // i 不得小于 0 !
									throw new Error('取得索引失败。');
								}

								_ids[i] = song;
								_cache[song.id] = song;
							});

							// 储存
							saveCache();

							setTimeout(_onload, 1, songs_to_data(_ids));
						};
					}

					return ajax(url, params);
				}

				nej.j[hookName] = ajaxPatch;

				// 强制刷新播放器
				// 用于解析下载 / 海外处理。
				var _next = nm.w.uv.prototype.kW;
				nm.w.uv.prototype.kW = function () {
					nm.w.uv.prototype.kW = _next;
					var self = this;

					// 之前的方法好像并不能刷新..
					// 于是就这样了 :D
					var index = this.bHO;
					self.bNx(self.bOB(+1), "ui");
					setTimeout(function () {
						self.bNx(index, "ui");
					}, 10);
				};
				document.querySelector('.nxt').click();
			}, H.scriptName, hookName, H.config.bInternational, self.cdn_ip);

		});
	},

	/**
	 * 外链播放器處理
	 */
	hookPlayerOutchain: function () {
		var self = this;
		H.waitUntil('nm.m.Dm', function() {
			self.linkDownload = $('<a>')
				.insertBefore('.oprBox > .bg.open')
				.addClass('bg next')
				.css({
					transform: 'rotate(90deg)',
					position: 'absolute',
					right: '21px',
					top: '3px',
					opacity: 0.6
				});

			// 尋找注入函數
			var fnPlayAtIndex = self.searchFunction(unsafeWindow.nm.m.Dm.prototype,
				'nm.m.Dm.prototype', '.mp3Url);');

			if (!fnPlayAtIndex)
				return ;

			unsafeExec(function(scriptName, fnPlayAtIndex, bInternational, cdn_ip, cssTitle, cssSubtitle) {
				function insertAfter(newNode, ref) {
					ref.parentNode.insertBefore(newNode, ref.nextSibling);
				}

				var subTitle = document.createElement('small');
				var pageTitle = document.getElementById('title');
				if (pageTitle) {
					insertAfter(subTitle, pageTitle);
					pageTitle.style.cssText = cssTitle;
					subTitle.style.cssText = cssSubtitle;
				}


				var _bakPlayerUpdateUI = nm.m.Dm.prototype[fnPlayAtIndex];

				var m = _bakPlayerUpdateUI.toString().match(/=this.(\w+)\[/);
				if (!m) return ;

				/**
				 * 抽取一个随机 CDN 服务器
				 * @return {[type]} [description]
				 */
				function randomCDN () {
					var ip = cdn_ip[~~(Math.random() * cdn_ip.length)];
					return 'http://' + ip + '/';
				}

				var tracks = m[1];
				nm.m.Dm.prototype[fnPlayAtIndex] = function(songIndex) {
					var i = parseInt(songIndex) || 0;
					var len = this[tracks].length;
					if (i >= len) {
						i = 0;
					} else if (i < 0) {
						i = len - 1;
					}

					var track = this[tracks][i];
					track.fee = track.status = 0;

					subTitle.textContent = '\u25b6 ' + track.name;
					subTitle.title = track.name;

					// 國際用戶轉換地址
					if (bInternational) {
						// TODO: 让用户更换黄易 CDN 地址
						// track.mp3Url = track.mp3Url.replace('http://', randomCDN());
						track.mp3Url = track.mp3Url.replace('//m', '//p');
					}

					var eveSongObj = {
						artist: track.artists.map(function(artist) {
							return artist.name;
						}).join('、'),
						name: track.name,
						song: JSON.stringify(track)
					};

					document.dispatchEvent(new CustomEvent(scriptName, {
						detail: eveSongObj
					}));

					return _bakPlayerUpdateUI.apply(this, arguments);
				};
				
			}, H.scriptName, fnPlayAtIndex, H.config.bInternational, self.cdn_ip, H.extract(function () {/*
				padding-top: .2em;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			*/}), H.extract(function () {/*
				padding-left: .5rem;
				color: #aaa;
				display: block;
				margin-top: -0.5rem;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			*/}));
		});
	},

	hookPlayerFm: function () {
		var self = this;
		H.waitUntil('nm.m.fO', function() {
			var hook = self.searchFunction(
				unsafeWindow.nm.m.fO.prototype, 'nm.x', '.mp3Url,true');

			self.linkDownload = $('<a>')
				.prependTo('.opts.f-cb>.f-fr')
				.addClass('icon icon-next')
				.html('&nbsp;')
				.css('transform', 'rotate(90deg)');
			
			unsafeExec(function(scriptName, hook) {
				var _bakPlaySong = nm.m.fO.prototype[hook];

				nm.m.fO.prototype[hook] = function(songObj) {
					var eveSongObj = {
						artist: songObj.artists.map(function(artist) {
							return artist.name;
						}).join('、'),
						name: songObj.name,
						song: JSON.stringify(songObj)
					};

					document.dispatchEvent(new CustomEvent(scriptName, {
						detail: eveSongObj
					}));

					return _bakPlaySong.apply(this, arguments);
				};
			}, H.scriptName, hook);
		});
	},

	// 服务器 1 ~ 8; 但是貌似 1 ~ 2 的最稳定
	getUri: function(song) {
		var dsfId = (song.hMusic || song.mMusic || song.lMusic).dfsId;
		var randServer = Math.floor(Math.random() * 2) + 1;

		var country = H.config.bInternational ? 'p' : 'm';
		return "http://" + country + randServer + ".music.126.net/" + (this.dfsHash(dsfId)) + "/" + dsfId + ".mp3";
	},

	/**
	 * 尋找 DFS 哈希
	 * @param  {Integer} dfsid   哈希值
	 * @return {String}          解析后的內容的值
	 */
	dfsHash: function(dfsid) {
		function strToKeyCodes (str) {
			return String(str).split('').map(function(e) {
				return e.charCodeAt();
			});
		}

		// 还原:
		// arr.map(function (e) { return String.fromCharCode(e) }).join('');
		// 不能直接传 String.fromCharCode !! 参数2 的 index 会玩坏返回值
		
		var keys = [
			51, 103, 111, 56, 38, 36,
			56, 42, 51, 42, 51, 104,
			48, 107, 40, 50, 41, 50
		];

		var fids = strToKeyCodes(dfsid).map(function(fid, i) {
			return (fid ^ keys[i % keys.length]) & 0xFF;
		});

		return CryptoJS
						.MD5(CryptoJS.lib.ByteArray(fids))
						.toString(CryptoJS.enc.Base64)
						.replace(/\//g, "_")
						.replace(/\+/g, "-");
	},

	tryEnableMusic: function () {
		var $disablePlayBtn = $('.u-btni-play-dis');
		if ($disablePlayBtn.length) {
			var rid = $disablePlayBtn.parent().data('rid');
			
			$disablePlayBtn.replaceWith(H.extract(function(){/*
				<a data-res-action="play" data-res-id="%id" data-res-type="18"
				href="javascript:;" class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true"
				title="播放"><i><em class="ply"></em>播放</i></a>

				<a data-res-action="addto" data-res-id="%id"
				data-res-type="18" href="javascript:;" class="u-btni u-btni-add"
				hidefocus="true" title="添加到播放列表"></a>
			*/}).replace(/%id/g, rid));
		}

		var $playMv = $('.u-icn-87');
		if ($playMv.length) {
			$playMv = $playMv.parent();

			this.getMvId($_GET.id, function (mvid) {
				$playMv.replaceWith($('<a>').attr({
					href: '/mv?id=' + mvid,
					title: '播放mv'
				}).html('<i class="icn u-icn u-icn-2" />'));
			});
		}
	},

	fetchSong: function (ids, cb) {
		var _crsf = unsafeWindow.NEJ_CONF.p_csrf.param;
		var _token = document.cookie.match(new RegExp(unsafeWindow.NEJ_CONF.p_csrf.cookie + '=(\\w+)'))[1];

		var reqObj = {
			ids: ids
		};
		reqObj[_crsf] = _token;

		var encryptedData = unsafeWindow.asrsea(JSON.stringify(reqObj), "010001","00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7", "0CoJUm6Qyw8W8jud");
		var postData = {
			params: encryptedData.encText,
			encSecKey: encryptedData.encSecKey
		};
		var _url = H.sprintf('/weapi/song/detail/?%s=%s', _crsf, _token);
		$.ajax({
			url: _url,
			method: 'POST',
			data: postData,
			dataType: 'json'
		}).done(cb);
	},

	getMvId: function (songId, cb) {
		var _cache;
		try {
			_cache = JSON.parse(localStorage.mv_cahce);
		} catch (e) {
			_cache = {};
		}

		if (songId in _cache) {
			cb(_cache[songId]);
			return ;
		}

		this.fetchSong([$_GET.id], function (data) {
			if (data.code == 200) {
				var mvid = _cache[songId] = data.songs[0].mvid;
				localStorage.mv_cahce = JSON.stringify(_cache);
				cb(mvid);
			}
		});
	},

	parseMv: function () {
		var $flashBox = $('#flash_box');
		if ($flashBox.length) {
			var html = $flashBox.html();
			var params = H.parseQueryString(html.match(/flashvars="([\s\S]+?)"/)[1].replace(/&amp;/g, '&'));

			var q = {
				hurl: '高清',
				murl: '标清',
				lurl: '渣画质'
			};

			var $dlHolder = $('<p>').css({
				textAlign: 'right'
			}).text('MV 下载: ').insertAfter($flashBox);
			Object.keys(q).forEach(function (key) {
				if (params[key]) {
					$dlHolder.append($('<a>').attr({
						href: H.uri(params[key], H.sprintf('%s[%sMV].mp4', params.trackName, q[key])),
						title: H.sprintf('下载 %s 的 %s Mv', params.trackName, q[key])
					}).prop('download', true).text(q[key]));
					$dlHolder.append(' | ');
				}
			});
			$dlHolder.append(H.sprintf ('提供: %s %s ', H.scriptName, H.version));

			if (H.config.bInternational) {
				$flashBox.html(html.replace(/restrict=true/g, 'restrict='));

				// 自动关闭弹出的提示框
				unsafeExec(function () {
					var t = setInterval(function () {
						var el = document.getElementsByClassName('zcls')[0];
						if (el) {
							el.dispatchEvent(new Event('mousedown'));
							clearInterval(t);
						}
					}, 100);
				});
			}
		}
	},

	onBodyFrame: function () {
		switch(location.pathname) {
			case '/mv':
				this.parseMv();
				break;

			case '/outchain/player':
				this.hookPlayerOutchain();
				break;

			case '/song':
				// TODO: Song DL button?
				if (H.config.bInternational)
					this.tryEnableMusic();
				break;
		}
	},

	onBody: function() {
		var self = this;
		this._doRemoval();
        unsafeWindow.GAbroad = false;

		// 不在框架執行
		if (H.isFrame) {
			this.onBodyFrame();
			return;
		}

		this.linkDownload = $('<a>').addClass(H.defaultDlIcon).appendTo($('.m-playbar .oper')).attr({
			title: '播放音乐, 即刻解析'
		}).click(function(e) {
			e.stopPropagation();
		});

		this.linkDownloadAll = $('<a>').addClass(H.defaultDlIcon).addClass('addall').text('全部下载').attr({
			title: '下载列表里的所有歌曲'
		}).click(function(e) {
			e.stopPropagation();

			var trackQueue = localStorage['track-queue'];
			var aria2 = new Aria2.BATCH(H.aria2, function() {
				return H.info(arguments);
			});

			var tracks = JSON.parse(trackQueue);
			var pads = ~~Math.log10(tracks.length);

			tracks.forEach(function (track, i) {
				var artists = track.artists.map(getName).join('、');

				var param = H.buildAriaParam({
					out: padZero(i) + ". " + track.name + " [" + artists + "].mp3"
				});

				aria2.add(Aria2.fn.addUri, [self.getUri(track)], param);
			});
			aria2.send(true);

			function getName (x) {
				return x.name;
			}

			function padZero (str) {
				for (var i = str.length; i < pads; i++) {
					str = '0' + str;
				}

				return str;
			}
		}).hide();

		// 暂时禁用批量下载功能。

		if (H.config.dUriType === 2/* URI_USE_ARIA */) {
			H.captureAria(this.linkDownload);
		} else {
			this.linkDownloadAll.addClass('jx_hide');
		}

		switch (location.pathname) {
			case '/demo/fm':
				this.hookPlayerFm();
				break;

			default:
				H.waitUntil(function() {
					return $('.listhdc > .addall').length;
				}, function() {
					self.linkDownloadAll.insertBefore($('.m-playbar .listhdc .addall')).after($('<a>').addClass('line jx_dl_line'));
				}, true, 500);
				this.hookPlayer();
		}
	}
});