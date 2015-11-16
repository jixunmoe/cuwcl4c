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
		this.regPlayer();

		// 优先使用 HTML5 播放器
		// 如果没有再考虑 Flash 支援
		
		unsafeExec(function () {
			var fakePlatForm = navigator.platform + "--Fake-mac";
			Object.defineProperty(navigator, "platform", {
				get: function(){ return fakePlatForm; },
				set: function(){}
			});

			// 順便, 解鎖全球限制
			window.GRestrictive = false;
		});
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
					nej.e[CR1] = function () {
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

		// 尋找播放器代碼
		H.waitUntil('nm.m.f', function() {
			var playerHooks, protoName, ref;
			ref = unsafeWindow.nm.m.f;

			for (var baseName in ref) {
				protoName = self.searchFunction(ref[baseName].prototype,
					"nm.m.f." + baseName + ".prototype", '<em>00:00</em>');

				if (protoName) {
					playerHooks = [baseName, protoName];
					break;
				}
			}

			if (!playerHooks)
				return;

			unsafeExec(function(scriptName, playerHooks, bInternational) {
				var clsFunc = playerHooks[0], method = playerHooks[1];
				var _bakPlayerUpdateUI;
				_bakPlayerUpdateUI = nm.m.f[clsFunc].prototype[method];

				nm.m.f[clsFunc].prototype[method] = function(songObj) {
					// 國際用戶自動把 m* 換成 p*
					if (bInternational)
						songObj.mp3Url = songObj.mp3Url.replace('http://m', 'http://p');

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

					return _bakPlayerUpdateUI.apply(this, arguments);
				};
				
			}, H.scriptName, playerHooks, H.config.bInternational);
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

			unsafeExec(function(scriptName, fnPlayAtIndex, bInternational, cssTitle, cssSubtitle) {
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
					if (bInternational)
						track.mp3Url = track.mp3Url.replace('http://m', 'http://p');

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
				
			}, H.scriptName, fnPlayAtIndex, H.config.bInternational, H.extract(function () {/*
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

	onBody: function() {
		var self = this;
		this._doRemoval();

		// 不在框架執行
		if (H.isFrame && location.pathname != '/outchain/player')
			return;

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
		});

		if (H.config.dUriType === 2/* URI_USE_ARIA */) {
			H.captureAria(this.linkDownload);
		} else {
			this.linkDownloadAll.addClass('jx_hide');
		}

		switch (location.pathname) {
			case '/demo/fm':
				this.hookPlayerFm();
				break;
			case '/outchain/player':
				this.hookPlayerOutchain();
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