{
	id: 'music.xiami',
	name: '虾米音乐',
	host: 'www.xiami.com',
	noSubHost: true,
	dl_icon: true,
	css: <% ~com.xiami.fm.css %>,

	onStart: function () {
		var that = this;
		H.hookRequire ('SEIYA', 'download', function (scriptName, _SEIYA, _download, songId) {
			document.dispatchEvent (new CustomEvent (scriptName + '-dlById', { detail: songId }));

			return true;
		}, H.scriptName);

		H.waitUntil ('KISSY.use', function () {
			unsafeExec (function (scriptName) {
				window.KISSY.use ('page/mods/player', function (_KISSY, mPlayer) {
					var _setMusicInfo = mPlayer.prototype.setMusicInfo;
					mPlayer.prototype.setMusicInfo = function (songObj) {
						this.isVIP = true;
						document.dispatchEvent (new CustomEvent (scriptName + '-dlByObj', { detail: JSON.parse (songObj) }));
						return _setMusicInfo.apply (this, arguments);
					};
				});
			}, H.scriptName);
		});

		document.addEventListener (H.scriptName + '-dlById', function (e) {
			that.fetch (e.detail, function (songObj) {
				GM_openInTab ( H.uri (songObj.src, songObj.title + '[' + songObj.artist + ']' + '.mp3'), false );
			});
		}, false);

		that.dlBtn = $('<a>')
			.addClass (H.defaultDlIcon)
			.attr('title', '等待获取音乐信息…');

		document.addEventListener (H.scriptName + '-dlByObj', function (e) {
			var songObj = e.detail;
			that.dlBtn
				.attr ('href',  H.uri (that.decrypt ( songObj.url ), songObj.song + '[' + songObj.artist + ']' + '.mp3'))
				.attr ('title', '下载: ' + songObj.song + ' [by ' + songObj.artist + ']');
		}, false);
	},

	onBody: function () {
		H.waitUntil (function () {
			return $('#J_trackFav').length;
		}, function () {
			this.dlBtn.insertBefore ($('#J_trackFav'));
		}.bind (this));
	},

	fetch: function (songId, callback) {
		if (!callback || !callback.call)
			return ;

		var that = this;
		$.ajax({
			type: 'GET',
			url: '/song/playlist/id/' + songId + '/object_name/default/object_id/0',
			cache: true,
			dataType: 'xml'
		}).success (function (xmlDoc) {
			var songObj = {};
			[].forEach.call (xmlDoc.getElementsByTagName ('track')[0].children, function (e) {
				// console.log ('%s => %s', e.tagName, e.textContent);
				songObj[e.tagName] = e.textContent;
			});
			songObj.src = that.decrypt (songObj.location);
			callback ( songObj );
		});
	},

	decrypt: function (encryptedAddress) {
		var spliter = parseInt(encryptedAddress[0]),
			link = encryptedAddress.slice(1),
			remainder = link.length % spliter,
			tmp = 0,
			ret = '',
			arr = [];

		for (var i = 0; i < spliter; i++) {
			arr.push ((remainder > i ? 1 : 0) + (link.length - remainder) / spliter);
		}

		for (i = 0; i < arr[1]; i++, tmp = 0) {
			for (var j = 0; j < spliter; j++) {
				ret += link[tmp + i];
				tmp += arr[j];
			}
		}
		return unescape(ret.substr(0, link.length)).replace(/\^/g, '0').replace(/\+/g, ' ');
	}
}