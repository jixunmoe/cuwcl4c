MODULE
/**
 * 第三方 - "音乐间谍" 解析接口
 * TYPE_SUB_MODULE
 */
({
	id: 'api.music.spy',

	storageKey: '_MUSIC_SPY',
	reloadCache: true,

	// 初始化监听事件
	init: function () {
		var self = this;

		window.addEventListener('storage', function (e) {
			switch (e.key) {
				case self.storageKey:
					self.reloadCache = true;
					break;
			}
		}, false);

		document.addEventListener(H.scriptName + '-NE-SPY', function (e) {
			var data = JSON.parse(e.detail);
			var id = data.id;
			self.getNetEase(id, unsafeWindow[data.callback]);
		});
	},

	// 进行缓存重载
	doReloadCache: function () {
		try {
			this.cache = JSON.parse(localStorage[this.storageKey]);
		} catch (ex) {
			this.cache = {};
		}

		this.reloadCache = false;
	},

	// 读入缓存
	cacheRead: function (songId) {
		if (this.reloadCache)
			this.doReloadCache();

		if (!this.cache.hasOwnProperty(songId))
			return null;

		return this.cache[songId];
	},

	// 储存缓存
	cacheSave: function () {
		localStorage[this.storageKey] = JSON.stringify(this.cache);
	},

	// 公开接口: 获取黄易的音乐地址
	// 优先读取缓存, 防止被查杀
	getNetEase: function (songId, callback) {
		var self = this;

		var cacheSong = this.cacheRead(songId);
		if (cacheSong) {
			callback(cacheSong.url);
			return ;
		}

		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://itwusun.com/search/wy/' + songId + '?p=1&f=json&sign=itwusun',
			onload: function(response) {
				// 解析数据
				var data = JSON.parse(response.responseText);
				if (data.length === 0) {
					callback(null);
					return ;
				}

				// 现在尝试读取歌曲数据
				var song = data.filter(function (song) {
					return song.Type == "wy" && song.SongId == songId;
				}).pop();

				// 没有找到
				if (!song) {
					callback(null);
					return ;
				}

				// 优先获取高清音质
				var url = song.SqUrl || song.HqUrl || song.LqUrl;

				// 储存
				var songObj = {
					time: Date.now(),
					url: url,
				};

				self.cache[songId] = songObj;
				self.cacheSave();
				callback(url);
			}
		});
	}
});

