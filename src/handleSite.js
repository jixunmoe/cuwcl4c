// 扩展规则函数
H.rule = {
	run: function (site, event) {
		var eve = site[event];

		var hostMatch;


		if (site._styleApplied)
			// 修正 CSS 可能被覆盖的错误
			H.fixStyleOrder (site.styleBlock);

		for (var i = 5; i--; ) {
			if (typeof eve == 'string') {
				eve = site[eve];
			} else {
				break;
			}
		}

		if (typeof eve == 'string') {
			H.error ('Repetitive ' + event + ' handler (' + eve + '), skip ..');
			eve = null;
			return ;
		}

		// Make this to an array.
		if (typeof site.host == 'string')
			site.host = [ site.host ];

		// Should have at least one site setup.
		if (!site.host.length) {
			H.error ('RULE: key `host` is missing!');
			return ;
		}

		// 检查域名
		if (!H.contains (site.host, H.lowerHost)) {
			// 是否检查子域名?
			if (site.noSubHost)
				return ;

			host = H.lowerHost;

			while (hostMatch = host.match (/^.+?\.(.+)/)) {
				if (H.contains (site.host, host = hostMatch[1])) {
					break;
				}
			}

			// No matching host name
			if (!hostMatch) return;
		}

		// 检查路径
		if (site.path) {
			if (site.path.call && !site.path(location.pathname)) return ;

			if (typeof site.path == 'string' && !H.beginWith (location.pathname, site.path)) return ;

			if (site.path instanceof RegExp && !site.path.test (location.pathname)) return ;

			if (site.path.map) { 
				for (var j = site.path.length, doesPathMatch; j-- && !doesPathMatch; )
					doesPathMatch = H.beginWith (location.pathname, site.path[j]);

				if (!doesPathMatch) return ;
			}
		}

		if (!site._styleApplied) {
			site._styleApplied = true;
			H.log ('应用 [%s] 的样式表…', site.name || '无名');

			var styleBlock = H.injectStyle ();

			if (typeof site.hide == 'string')
				H.forceHide.call  (styleBlock, site.hide);
			else if (site.hide && site.hide.length)
				H.forceHide.apply (styleBlock, site.hide);

			if (typeof site.show == 'string')
				H.forceShow.call  (styleBlock, site.show);
			else if (site.show && site.show.length)
				H.forceShow.apply (styleBlock, site.show);

			// 自定义 css 注入
			if (typeof site.css == 'string')
				H.injectStyle.call  (styleBlock, site.css);
			else if (site.css && site.css.length)
				H.injectStyle.apply (styleBlock, site.css);

			// 下载按钮
			if (site.dl_icon) {
				if (site.dl_icon.map) {
					site.dl_icon = site.dl_icon.join ('::before, ');
				} else if (typeof site.dl_icon != 'string') {
					site.dl_icon = H.defaultDlClass;
				}

				H.injectStyle.call (styleBlock, H.sprintf(<% ~AA.dl_btn.css %>, site.dl_icon));
			}

			site.styleBlock = styleBlock;
		}

		if (!eve) return ;
		H.info ('执行规则: %s<ID: %s>[事件: %s]', site.name || '<未知>', site.id || '未知', event);

		return eve.call (site);
	},

	/**
	 * Find rule by ID
	 * @param  {String} id Rule id
	 * @return {Rule}      Rule Object
	 */
	find: function (id) {
		return sites.filter(function (site) { return site.id == id; }).pop();
	}
};

return function (event) {
	for (var i = sites.length; i--; ) {
		if (H.isFrame && sites[i].noFrame)
			continue;
		
		if (H.rule.run(sites[i], event))
			return true;
	}
};