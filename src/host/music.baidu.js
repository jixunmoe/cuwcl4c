{
	id: 'music.baidu',
	name: '百度音乐',
	host: 'music.baidu.com',
	path: /^\/song\/\d+\/download/,

	hide: '.foreign-tip',
	_setText: function (text) {
		if (text[0] == '+') {
			this.btnDownload.title.append(text.slice(1));
		} else {
			this.btnDownload.title.text(text);
		}
	},
	_setLink: function (url) {
		this.btnDownload.btn.attr('href', url);
	},
	_btn: function (text, outerIcon, innerIcon) {
		var btn = $('<a><span class="inner"><i class="icon btn-icon-' + innerIcon + '">')
			.addClass('btn btn-' + outerIcon + ' actived')
			.attr('target', '_blank')
			.attr('href', '#')
			.appendTo(this.p);

		return ({
			btn: btn,
			title: $('<span>').appendTo($('.inner', btn)).text(text)
		});
	},

	_initDl: function (e) {
		this.downloadInfo = JSON.parse(e.detail).downloadInfo;
	},

	onStart: function () {
		document.addEventListener (H.scriptName, this._initDl.bind (this), false);

		unsafeExec(function (scriptName) {
			// 屏蔽广告写出
			document.write = (function write(){}).bind(0);

			window.ting = {};
			var origInitDownload;
			Object.defineProperty(window.ting, 'initDownload', {
				get: function () {
					return function (initOpts) {
						document.dispatchEvent (new CustomEvent (scriptName, {detail: JSON.stringify (initOpts)}));

						return origInitDownload.apply(this, arguments);
					};
				},
				set: function (idl) {
					origInitDownload = idl;
				}
			});
		}, H.scriptName);
	},

	onBody: function () {
		var self = this;
		this.parser = H.rule.find ('music.baidu.play');
		if (!this.parser) {
			H.error ('Required rule `music.baidu.play` missing, please re-install this script.');
			return ;
		}

		// 度娘的按钮前面插入我们的
		var operDiv = $('.operation').prepend('<div class="clearfix">');
		this.p = $('<p>').prependTo(operDiv).css('margin-bottom', '2em');

		// 添加按钮
		this.btnDownload = this._btn('请选择音质', 'h', 'download-small');
		// this.btnExport = this._btn('导出地址', 'b', 'download-small');
		this.btnDownload.btn.click(this._clickDl.bind(this));

		$('.down-radio').change(function () {
			self.changeBitrate($(this));
		}).filter(':checked').change();
	},

	_clickDl: function (e) {
		if (this.btnDownload.btn.data ('do-nothing'))
			return ;

		e.preventDefault();
		var self = this;
		var $el = this.$el;

		var sid  = $el.data('sid'),
			rate = $el.data('rate'),
			fmt  = $el.data('format');

		self._setText ('+ (开始解析)');
		var fn = H.sprintf('%s [%s].%s', this.downloadInfo.song_title, this.downloadInfo.singer_name, fmt);
		this.parser._addFav (sid, function (errInfo) {
			var bNeedRmFav = errInfo.code === 22000;

			self.parser._getRealUrl (self.parser._buildUrl(sid, rate, fmt), function (url) {
				H.addDownload(url, fn);
				self._setLink (H.uri (url, fn));
				self._setText ('+ (解析完毕)');
				self.btnDownload.btn.data('parse-' + rate, [url, fn]);
				if (bNeedRmFav) self.parser._rmFav (sid);

				self.btnDownload.btn.data ('do-nothing', true);
			});
		});
	},

	changeBitrate: function ($el) {
		this.$el = $el;
		this._setText (H.sprintf('下载 (%skbps, %s 格式)', $el.data('rate'), $el.data('format')));
		var dataUrl = this.btnDownload.btn.data ('parse-' + $el.data('rate'));
		this.btnDownload.btn.data ('do-nothing', !!dataUrl);

		if (dataUrl) {
			this._setLink (dataUrl);
			this._setText ('+ (已解析)');
		}
	}
}