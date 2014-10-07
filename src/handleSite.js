// function (event)
var site, eve, host, hostMatch;
for (var i = sites.length; i--; ) {
	site = sites[i];
	eve  = site[event];

	while (typeof eve == 'string') {
		if (eve == site[eve]) {
			H.error ('Repetitive ' + event + ' handler (' + eve + '), skip ..');
			eve = null;
			break;
		}

		eve = site[eve];
	}

	// Make this to an array.
	if (typeof site.host == 'string')
		site.host = [ site.host ];

	// Should have at least one site setup.
	if (!site.host.length)
		throw new Error ('Site config error: No matching host.');

	// Check against host config.
	if (!H.contains (site.host, H.lowerHost)) {
		// Check if allow sub-domain check.
		if (site.noSubHost)
			continue;

		host = H.lowerHost;

		while (hostMatch = host.match (/^.+?\.(.+)/)) {
			if (H.contains (site.host, host = hostMatch[1])) {
				break;
			}
		}

		// No matching host name
		if (!hostMatch) continue;
	}

	// Check against pathname detect
	if (site.path) {
		if (site.path.call && !site.path(location.pathname)) continue;

		if (typeof site.path == 'string' && !H.beginWith (location.pathname, site.path)) continue;

		if (site.path instanceof RegExp && !site.path.test (location.pathname)) continue;

		if (site.path.map) { 
			for (var j = site.path.length, doesPathMatch; j-- && !doesPathMatch; )
				doesPathMatch = H.beginWith (location.pathname, site.path[j]);

			if (!doesPathMatch) continue;
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
			if (typeof site.dl_icon != 'string')
				site.dl_icon = 'jx_dl';

			H.injectStyle.apply (styleBlock, H.sprintf(<% ~AA.dl_btn.css %>, site.dl_icon));
		}

		site.styleBlock = styleBlock;
	}

	// If event is not valid, then skip.
	if (!eve) continue;

	H.log ('执行规则: %s[%s]', site.name || '<未知规则>', event);

	// If return true, stop process current event;
	if (eve.call (site))
		break;
}