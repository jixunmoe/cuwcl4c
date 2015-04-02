// 初始化
var createElement = document.createElement.bind (document);

var H = {
	scriptName: 'CUWCL4C',
	scriptHome: 'https://greasyfork.org/zh-CN/scripts/2600',
	reportUrl:  'https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600',
	isFrame: (function () {
		try {
			return unsafeWindow.top != unsafeWindow.self;
		} catch (e) {
			return true;
		}
	})(),

	version:    GM_info.script.version,
	currentUrl: location.href.split ('#')[0],
	lowerHost:  location.hostname.toLowerCase(),
	directHost: location.hostname.match(/\w+\.?\w+?$/)[0].toLowerCase(),

	defaultDlIcon:   'jx_dl',
	defaultDlClass: '.jx_dl',

	nop: function () {},

	merge: function (parent) {
		if (arguments.length < 2)
			return parent || {};

		var args = arguments;
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i]) {
				Object.keys (arguments[i]).forEach (function (key) {
					parent[key] = args[i][key];
				});
			}
		}

		return parent;
	},

	extract: function (foo) {
		return foo.toString().match(/\/\*([\s\S]+)\*\//)[1].replace(/\s*--.+/g, '');
	},

	sFormat: function (sourceStr) {
		var args = arguments,
			argLen = args.length;

		if (argLen <= 1) return sourceStr; // 无效或无参数

		for (var i = argLen; i--; )
			sourceStr = sourceStr.replace (new RegExp('%' + i + '([^\\d]|$)','g'), args[i]);

		return sourceStr;
	},

	sprintf: function (sourceStr) {
		var args = arguments,
			argLen = args.length;

		if (argLen <= 1) return sourceStr; // 无效或无参数

		for (var i = 1; i < argLen; i++)
			sourceStr = sourceStr.replace (/%[sd]/i, args[i]);

		return sourceStr;
	},

	beginWith: function (str, what) {
		return str.indexOf (what) ==  0;
	},

	contains: function (str, what) {
		return str.indexOf (what) != -1;
	},

	addDownload: function (url, file) {
		if (H.config.dUriType == 2) {
			H.addToAria(url, file);
		} else {
			GM_openInTab (H.uri(url, file), true);
		}
	},

	uri: function (url, filename, ref) {
		switch (H.config.dUriType) {
			case 1:
				return 'cuwcl4c://|1|' + [
					url,
					filename.toString().replace(/['"\/\\:|]/g, '_'),
					(ref || location.href).toString().replace(/#.*/, '')
				].join('|');

			case 2:
				// 如果脚本没有手动绑定 Aria 连接
				// 此处进行全局连接接管
				if (!H.hasAriaCapture)
					H.captureAria ();

				return 'aria2://|' + [
					url,
					filename.toString().replace(/['"\/\\:|]/g, '_'),
					(ref || location.href).toString().replace(/#.*/, '')
				].join('|');

			default:
				return url;
		}
	},

	setupAria: function (bForceNew) {
		if (bForceNew || !H.aria) {
			H.aria2 = new Aria2({
				auth: {
					type: H.config.dAria_auth,
					user: H.config.sAria_user,
					pass: H.config.sAria_pass
				},
				host: H.config.sAria_host,
				port: H.config.dAria_port
			});
		}

		return H.aria2;
	},

	addToAria: function (url, filename, referer, cookie, headers) {
		var ariaParam = {
			out: filename,
			referer: referer || location.href,
			dir: H.config.sAria_dir,
			'user-agent': navigator.userAgent,
			header: headers || []
		};

		if (cookie === true)
			cookie = document.cookie;

		if (cookie)
			ariaParam.header.push ('Cookie: ' + cookie);

		H.aria2.addUri ([url], ariaParam, H.nop, function (r) {
			var sErrorMsg;
			if (r.error) {
				sErrorMsg = H.sprintf ('错误代码 %s: %s', r.error.code, r.error.message);
			} else {
				sErrorMsg = '与 Aria2 后台通信失败, 服务未开启?';
			}

			alert (H.sprintf('[%s] 提交任务发生错误!\n\n%s', H.scriptName, sErrorMsg));
		});
	},

	captureAria: function (el) {
		if (H.config.dUriType !== 2)
			return ;

		H.hasAriaCapture = true;
		H.setupAria ();
		
		$(el || document).click(function (e) {
			var linkEl = e.target;

			if (linkEl && linkEl.tagName == 'A' && H.beginWith(linkEl.href, 'aria2://|')) {
				e.stopPropagation ();
				e.preventDefault  ();

				var link = linkEl.href.split('|');
				H.addToAria(link[1], decodeURIComponent(link[2]), link[3], linkEl.classList.contains('aria-cookie'));
			}
		});
	},

	buildAriaParam: function (opts) {
		if (opts.cookie) {
			opts.header = opts.header || [];
			opts.header.push ('Cookie: ' + (opts.cookie || document.cookie));
			delete opts.cookie;
		}
		return H.merge ({
			referer: location.href,
			dir: H.config.sAria_dir,
			'user-agent': navigator.userAgent
		}, opts);
	},

	batchDownload: function (fCallback, ref, arrDownloads) {
		H.setupAria ();

		return H.aria2.batchAddUri.apply (
			// this
			H.aria2, 

			// fCallback, file1, file2, ...
			[ fCallback ].concat (
				arrDownloads.map (function (arg) {
					arg.options = H.buildAriaParam (H.merge({ referer: ref }, arg.options));
					return arg;
				})
			)
		);
	}
};

H.merge (H, {
	_log: console.log.bind (console),
	_inf: console.info.bind (console),
	_war: console.warn.bind (console),
	_err: console.error.bind (console),

	log: function (_prefix, msg) {
		var args = [].slice.call(arguments, 1);

		if (typeof msg == 'string') {
			// TODO: Simplify this?
			H._log.apply (0, [].concat.apply ([_prefix + msg], args.slice(1)));
		} else {
			H._log.apply (0, [].concat.apply([_prefix], args));
		}
	}.bind (H, H.sprintf ('[%s][日志] ', H.scriptName)),

	info: function (_prefix, msg) {
		var args = [].slice.call(arguments, 1);

		if (typeof msg == 'string') {
			// TODO: Simplify this?
			H._inf.apply (0, [].concat.apply ([_prefix + msg], args.slice(1)));
		} else {
			H._inf.apply (0, [].concat.apply([_prefix], args));
		}
	}.bind (H, H.sprintf ('[%s][信息] ', H.scriptName)),

	error: function (_prefix, msg) {
		var args = [].slice.call(arguments, 1).concat ('\n\n错误追踪' + new Error().stack);

		if (typeof msg == 'string') {
			H._err.apply (0, [].concat.apply ([_prefix + msg], args.slice(1)));
		} else {
			H._err.apply (0, [].concat.apply([_prefix], args));
		}
	}.bind (H, H.sprintf ('[%s][错误] ', H.scriptName)),

	warn: function (_prefix, msg) {
		var args = [].slice.call(arguments, 1);

		if (typeof msg == 'string') {
			// TODO: Simplify this?
			H._inf.apply (0, [].concat.apply ([_prefix + msg], args.slice(1)));
		} else {
			H._inf.apply (0, [].concat.apply([_prefix], args));
		}
	}.bind (H, H.sprintf ('[%s][警告] ', H.scriptName))
});

H.config = H.merge ({
	bDiaplayLog: true,

	dUriType:   0,
	dAria_auth: 0,

	sAria_user: '',
	sAria_pass: '',
	sAria_host: '127.0.0.1',
	dAria_port: 6800,
	sAria_dir: 'D:\\Download\\',

	bUseCustomRules: false,
	sCustomRule: ''
}, (function (conf) {
	if (!conf) return {};

	try {
		return JSON.parse (conf);
	} catch (e) {
		H.info ('配置文件 [%s] 无效, 现在使用空白配置.', conf);
		return {};
	}
})(GM_getValue (H.scriptName)));

// 2014.11.30: 不显示日志
if (!H.config.bDiaplayLog || H.isFrame) {
	// 屏蔽日志函数
	['log', 'info'].map(function (fooName) {
		H['_' + fooName.slice(0, 3)] = H[fooName] = H.nop;
	});
}

H.merge (H, {
	hookRequire: function (namespace, foo, callback) {
		// The first one is `this`, so not going to be used.
		var args = [].slice.call (arguments, 2);
		args[0] = null;

		var hookReq = createElement ('script');
		hookReq.textContent = ';(' + function (namespace, foo, custom) {
			var $ns, $foo;
			Object.defineProperty (window, namespace, {
				get: function () {
					return $ns;
				},
				set: function (n) {
					$ns = n;

					$foo = n[foo];
					Object.defineProperty ($ns, foo, {
						get: function () {
							return function () {
								var ret = custom.apply (0, [].concat.apply([$ns, $foo.bind ($ns)], arguments));
								if (ret) return ret;
								return $foo.apply ($ns, arguments);
							};
						},
						set: function (fnNew) {
							$foo = fnNew;
						}
					});
				}
			});
		} + ')("' + namespace + '", "' + foo + '", Function.bind.apply ('
			+ callback + ', ' + JSON.stringify (args) + '));';
		document.head.appendChild (hookReq);
		return hookReq;
	},

	hookDefine: function (fooName, callback) {
		// The first one is `this`, so not going to be used.
		var args = [].slice.call (arguments, 1);
		args[0] = null;

		var hookDef = createElement ('script');
		hookDef.textContent = ';(' + function (fooName, custom) {
			var $define;
			Object.defineProperty (window, fooName, {
				get: function () {
					return function () {
						var ret = custom.apply (0, [].concat.apply([$define], arguments));
						if (ret) return ret;
						return $define.apply (window, arguments);
					};
				},
				set: function (n) {
					$define = n;
				}
			});
		} + ')("' + namespace + '", "' + foo + '", Function.bind.apply ('
			+ callback + ', ' + JSON.stringify (args) + '));';
		document.head.appendChild (hookDef);
		return hookDef;
	},

	base64Decode: function (str) {
		return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(str));
	},
	getFlashVars: function (ele) {
		// jQuery element fix.
		if (!ele) return {};
		if (ele.jquery) ele = ele[0];

		// Check if is a flash object
		if (ele.type.indexOf('flash') == -1) return {};

		for(var flashObject, flashVars = {}, i = ele.childNodes.length; i--;)
			if (ele.childNodes[i].name == 'flashvars') {
				flashObject = ele.childNodes[i];
				break;
			}

		if (flashObject) {
			flashObject.value.replace(/&amp;/g, '&').replace(/([\s\S]+?)=([\s\S]+?)(&|$)/g, function (n, key, value) {
				// 利用正则的批量替换功能抓取数据 ^^
				flashVars [key] = decodeURIComponent(value);
			});
		}

		return flashVars;
	},

	getFirstKey: function (obj) {
		return Object.keys(obj)[0];
	},
	getFirstValue: function (obj) {
		try {
			return obj[H.getFirstKey(obj)];
		} catch (e) {
			return null;
		}
	},

	getLinkExt: function (url) {
		return url.match(/.+\/(?:[^.]+(\..+?))(?:\?|$)/)[1];
	},

	getLinkExtFromQuery: function (url) {
		if (H.contains(url, '?')) {
			var parts = link3.slice(link3.indexOf('?') + 1).replace(/[^=]+?=(.+?(&|$))/g, '$1').split('&');
			for (var i = parts.length, exts; i--; ) {
				if (exts = parts[i].match(/\.(?:[a-z0-9]{2,9})/)) {
					return exts[0];
				}
			}
		}
		return H.getLinkExt (url);
	},

	parseQueryString: function (rawUrl) {
		var urlParams = (H.contains (rawUrl, '?')
			? rawUrl.slice (rawUrl.indexOf('?') + 1)
			: rawUrl).split('&');

		var ret = {};
		for (var i = 0, queryStr, posEqual; i < urlParams.length; i++) {
			queryStr = urlParams[i].toString();
			posEqual = queryStr.indexOf('=');
			if (posEqual == -1) continue;

			ret[decodeURIComponent(queryStr.slice (0, posEqual))] =
				decodeURIComponent(queryStr.slice (posEqual + 1));
		}

		return ret;
	},

	wordpressAudio: function () {
		H.log('WordPress Audio 插件通用代码 启动');

		var fixEmbed = function (obj) {
			if (obj.tagName != 'OBJECT' || obj.hasAttribute(H.scriptName)) return;

			var songObj  = H.getFlashVars(obj);
			var songAddr = H.base64Decode(songObj.soundFile);
			$('<a>').html('下载「' + songObj.titles + '」<br>')
				.attr ({
					href: H.uri (songAddr, songObj.titles + songAddr.slice(-4)),
					target: '_blank'
				}).insertBefore (obj);

			obj.setAttribute (H.scriptName, '^^');
		};

		new MutationObserver (function (eve) {
			for (var i=0; i<eve.length; i++)
				if (eve[i].target.className == 'audioplayer_container' && eve[i].addedNodes.length)
					fixEmbed(eve[i].addedNodes[0]);
		}).observe ($('.post > .entry')[0], {
			childList: true,
			subtree: true
		});

		// Firefox fix.. = =
		$('object[id^="audioplayer_"]').each(function () { fixEmbed(this); });
		H.log('WordPress Audio 插件通用代码 结束');
	},

	waitUntil: function (checkCond, fCallback, nTimeOut, nTimeInterval) {
		if (typeof fCallback != 'function')
			// Required.
			return ;

		if ('string' == typeof checkCond && checkCond.indexOf ('.') !== -1) {
			checkCond = checkCond.split ('.');
		}
		if (checkCond instanceof Array) {
			checkCond = function (vars) {
				for (var i = 0, r = unsafeWindow; i < vars.length; i++) {
					r = r[vars[i]];
					if (!r)
						return ;
				}

				return true;
			}.bind (null, checkCond.slice());
		};

		var timer = setInterval(function () {
			if ('function' == typeof checkCond) {
				try {
					if (!checkCond()) return;
				} catch (e) {
					// Not ready yet.
					return ;
				}
			} else if ('string' == typeof checkCond) {
				if (typeof (unsafeWindow[checkCond]) == 'undefined')
					return ;
			}
			clearInterval(timer);
			try {
				fCallback.call(this);
			} catch (e) {
				H.error ('[H.waitUntil] Callback for %s had an error: %s', H.version, e.message);
			}
		}, nTimeInterval || 150);

		// 如果 nTimeOut 的传入值为 true, 则无限制等待.
		if (nTimeOut !== true) {
			setTimeout (function () {
				// Timeout
				clearInterval(timer);
			}, nTimeOut || 10000);
		}
	},

	makeFineCss: function (name, param) {
		var ret = {};
		ret[name] = param;
		['moz', 'webkit'].forEach (function (e) {
			ret['-' + e + '-' + name] = param;
		});
		return ret;
	},

	makeDelayCss: function (transitionText) {
		return H.makeFineCss('transition', transitionText || 'all .2s');
	},

	makeRotateCss: function (deg) {
		return H.makeFineCss('transform', 'rotate(' + (deg || 180) + 'deg)');
	},

	createNumPad: function (maxLen, targetInput, finishCallback, codeResetCallback) {
		if (!codeResetCallback)
			codeResetCallback = eFunc;

		var table = createElement('table'),
			rcde = $(targetInput)[0];
		$(table).css({
			'background-color': '#ffcc99',
			'position': 'relative',
			'bottom': '164px',
			'left': '170px'
		});
		for (var i = 0; i < 4; i++) {
			var tr = createElement('tr');
			for (var j = 0; j < 3; j++) {
				var td = createElement('td');
				td.innerHTML = $(td).attr('k', '123456789C0←'[i * 3 + j]).attr('k');
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		$(table).find('td').click(function () {
			var val = rcde.value,
				len = val.length,
				key = $(this).attr('k') || '';
			$(rcde).focus();

			switch (key) {
				case '←':
					rcde.value = val.slice(0, -1);
					break;
				case 'C':
					rcde.value = '';
					codeResetCallback ();
					break;
				default:
					rcde.value += key;
					len ++;
					if (len >= maxLen) {
						if (finishCallback(rcde.value)) {
							$(table).hide();
						} else {
							codeResetCallback();
							rcde.value = '';
						}
					}
					break;
			}
		}).css({
			font: 'bold 25px Tahoma',
			color: 'red',
			cursor: 'pointer',
			verticalAlign: ' middle',
			textAlign: ' center',
			border: '1px solid #DDDDDD',
			padding: '6px',
			width: '40px',
			height: '40px'
		});
		return table;
	},
	reDirWithRef: function (targetUrl) {
		if (!targetUrl) return ;
		H.info ('Redirect to %s...', targetUrl);
		
		var link = $('<a>')
			.attr('href', targetUrl)
			.text('正在跳转 [' + targetUrl + '], 请稍后.. ')
			.prependTo(document.body)
			.css ({fontSize: 12, color: 'inherit'});
		
		link[0].click();
		return true;
	},

	// 网盘地址自动导向 [基于 phpDisk 的网盘]
	phpDiskAutoRedir: function (fCallback){
		if (!fCallback) {
			fCallback = document.body ? H.reDirWithRef : function (p) {
				H.waitUntil('document.body', H.reDirWithRef.bind(null, p));
			};
		}

		var rCheckPath = /\/(file)?(file|view)([\/.\-_].*)/;
		// Because location.xx = xx does not pass the refer, so we're going to make a dummy form.
		if (rCheckPath.test (location.pathname)) {
			fCallback (location.pathname.replace (rCheckPath, '/$1down$3'));
		} else if (H.beginWith(location.pathname, '/viewfile')) {
			fCallback (location.pathname.replace('/viewfile', '/download'));
		} else { return false; }

		return true;
	},

	// 插入样式表
	injectStyle: function () {
		var styleBlock = (this && this.tagName == 'STYLE') ? this : createElement('style');
		styleBlock.textContent += [].join.call(arguments, '\n');
		document.head.appendChild(styleBlock);
		return styleBlock;
	},

	// 强制隐藏/显示某些元素
	forceHide: function () {
		return H.injectStyle.call (this, [].slice.call(arguments).join (', ') + '{ display: none !important }'  );
	},
	forceShow: function () {
		return H.injectStyle.call (this, [].slice.call(arguments).join (', ') + '{ display: block !important }' );
	},
	// 强制隐藏框架
	forceHideFrames: function (){
		return forceHide('iframe, frameset, frame');
	},

	// 通用 jPlayer 注入
	jPlayerPatcher: function (callback, namespace) {
		// 默认为 jPlayer
		if (!namespace) namespace = 'jPlayer';

		H.info ('等候 jPlayer 就绪 ..');
		H.waitUntil('$.' + namespace + '.prototype.setMedia', function () {
			H.info ('开始绑定函数 ..');
			unsafeOverwriteFunctionSafeProxy ({
				setMedia: function (newMedia) {
					H.info ('歌曲数据: ', newMedia);
					callback (newMedia);
					throw new ErrorUnsafeSuccess();
				}
			}, unsafeWindow.$[namespace].prototype, '.$.' + namespace + '.prototype');
			H.info ('绑定完毕, enjoy~');
		});
	},

	fixStyleOrder: function (elStyle) {
		$('head').append (elStyle);
	}
});

// 简单屏蔽广告
unsafeWindow.antiadsv2 = 0;
unsafeDefineFunction ('CNZZ_AD_BATCH', function () {});

// 空白函数, 适合腾空页面函数。
var eFunc = function () {},
	tFunc = function () { return true;  },
	fFunc = function () { return false; };

var $_GET = H.parseQueryString (H.currentUrl);

H.log ('脚本开始执行。');
H.log ('域名: %s; 完整地址: %s; 请求参数: %s', H.directHost, H.currentUrl, JSON.stringify ($_GET));
H.log ('脚本版本 [ %s ] , 如果发现脚本问题请提交到 [ %s ] 谢谢。', H.version, H.reportUrl);
