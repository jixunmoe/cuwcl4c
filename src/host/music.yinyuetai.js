{
	id: 'music.yinyuetai',
	name: '音悦台下载解析',
	host: ['yinyuetai.com'],

	_linkHolder: null,
	onBody: function () {
		if (H.beginWith (location.pathname, '/video/')) {
			this._linkHolder = $('<span>').css ({
				color: 'white',
				fontSize: 'small',
				marginLeft: '1.5em'
			}).appendTo ($('.vchart, .pl_title').first());

			this.fetch(location.pathname.match(/\d+/));
		} else {
			H.waitUntil (function () {
				return $('.J_video_info').length;
			}, this.procListPage.bind (this));
		}
	},

	procListPage: function () {
		H.info ('就绪.');

		var mo = new MutationObserver (function () {
			H.info ('MV 已更新, 抓取新的下载地址..');
			this._linkHolder = $('<p>').prependTo ('.J_mv_content');
			this.fetch($('.J_video_info > a').attr('href').match (/\d+/));
		}.bind (this));

		mo.observe (document.querySelector('.J_video_info'), {
			childList: true
		});
	},

	fetch: function (videoId) {
		var that = this;
		GM_xmlhttpRequest ({
			method: 'GET',
			url: 'http://www.yinyuetai.com/insite/get-video-info?json=true&videoId=' + videoId,
			onload: function (u) {
				try {
					var r = JSON.parse (u.responseText);
				} catch (e) {
					that._linkHolder.text('解析失败：数据格式错误。');
					return ;
				}

				if (r.error) {
					that._linkHolder.text('解析失败：' + r.message);
					return ;
				}

				H.info ('解析完毕, 加入下载地址..');
				that.addDownload (r.videoInfo.coreVideoInfo);
			},
			onerror: function (r) {
				that._linkHolder.text('很抱歉, 解析下载地址失败..');
			}
		});
	},

	addDownload: function (videoInfo) {
		this._linkHolder.text('下载: ');
		var rawLinks = videoInfo.videoUrlModels;

		for (var i = rawLinks.length; i--; ) {
			$('<a>').text(rawLinks[i].QualityLevelName)
				// TODO fix the name
				.attr('href', H.uri(
					rawLinks[i].videoUrl, 
					H.sprintf('%s [%s][%s]%s',
						videoInfo.videoName,
						videoInfo.artistName,

						rawLinks[i].QualityLevelName,
						H.getLinkExt(rawLinks[i].videoUrl))
				))
				.attr('title', '下载: ' + videoInfo.videoName).appendTo(this._linkHolder)
				.addClass ('c_cf9');

			this._linkHolder.append(' | ');
		}

		this._linkHolder.append(H.sprintf ('提供: %s %s ', H.scriptName, H.version));
	}
}