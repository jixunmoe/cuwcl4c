// ==UserScript==
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_info

// @run-at         document-start
// @name:en        Bypass Wait, Code & Login on Websites
// @name           跳过网站等待、验证码及登录
// @name:zh-CN     跳过网站等待、验证码及登录
// @name:zh-TW     繞過站點等待、識別碼及登錄

// @description       移除各类网站验证码、登录、倒计时及更多!
// @description:zh-CN 移除各类网站验证码、登录、倒计时及更多!
// @description:zh-TW 移除各類站點識別碼、登錄、倒計時及更多!
// @description:en    Remove verify code, login requirement, counting down... and more!


// @copyright      2014+, Yulei, Mod by Jixun.
////               Based on [Crack Url Wait Code Login] By Yulei

// 骑牛的会请求不存在的 jquery.map 文件，改用官网的
// @require        https://code.jquery.com/jquery-2.1.4.min.js

/// CryptoJS 相关库
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/core-min.js
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/enc-base64-min.js
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/md5-min.js
// @require        https://greasyfork.org/scripts/6696/code/CryptoJS-ByteArray.js

/// 非同步枚举
// @require        https://greasyfork.org/scripts/3588-interval-looper/code/Interval-Looper.js

/// 兼容 GM 1.x, 2.x
// @require        https://greasyfork.org/scripts/2599/code/gm2-port-v104.js

/// Aria2 RPC
// @require        https://greasyfork.org/scripts/5672/code/Aria2-RPC-build-9.js

// @author         Jixun.Moe<Yellow Yoshi>
// @namespace      http://jixun.org/
// @version        3.0.443

// 全局匹配
// @include *

// 扔掉百度的广告框架页面
// @exclude http://pos.baidu.com/*

// 扔掉谷歌
// @exclude http://gmail.com/*
// @exclude http://.google.tld/*
// @exclude http://*.gmail.com/*
// @exclude http://*.google.tld/*
// ==/UserScript==


(function () {
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


	var sites = [ /* Compiled from AA.config.js */
{
	id: 'internal.config',
	name: '脚本配置页面',
	host: ['localhost', 'jixunmoe.github.io'],
	path: ['/conf/', '/cuwcl4c/config/'],

	onStart: function () {
		unsafeWindow.rScriptVersion = H.version;
		unsafeWindow.rScriptConfig  = JSON.stringify (H.config);
		H.info (H.config);

		var _c = confirm;
		document.addEventListener ('SaveConfig', function (e) {
			try {
				var config = JSON.stringify (JSON.parse (e.detail));
				if (_c (H.sprintf ('确定储存设定至 %s?', H.scriptName)))
					GM_setValue (H.scriptName, config);
			} catch (e) {
				alert ('解析设定值出错!');
			}
		});
	},
	onBody: function () {
        H.captureAria(document.body);
	}
}
,
/* Compiled from dl.119g.js */
{
	id: 'dl.119g',
	name: '119g 网盘',
	host: ['d.119g.com'],
	noSubHost: true,

	onStart: function () {
		if (H.beginWith (location.pathname, '/f/') && !H.contains (location.pathname, '_bak')) {
			location.pathname = location.pathname.replace(/(_.+)?\./, '_bak.');
		}
	}
},
/* Compiled from dl.123564.js */
{
	id: 'dl.123564',
	name: '123564 网盘',
	host: ['123564.com', 'm.123564.com'],
	noSubHost: true,

	css: '.ad1{height:1px !important}',
	hide: ['#loading', '#yzm'],
	show: '#download',
	onStart: function () {
		unsafeWindow.killpanads = 1;
	},
	onBody: function () {
		$('#download > a').click();
	}
}
,
/* Compiled from dl.7958.js */
{
	id: 'dl.7958',
	name: '千军万马网盘系列',
	host: ['7958.com', 'qjwm.com'],
	hide: [
		'#downtc', '[id^="cpro_"]', '.download_alert', '#inputyzm',
		'#house', '#uptown', 'a[href$="money.html"]', 'a[href$="reg.html"]'
	],
	show: ['#downtc2', '.new_down'],
	onBody: function () {
		if (H.contains (location.pathname, 'down_')) {
			location.pathname = location.pathname.replace('_', 'load_');
		}

		H.waitUntil('authad', function () {
			unsafeDefineFunction ('authad', tFunc);
		});
	}
},
/* Compiled from dl.9pan.js */
{
	id: 'dl.9pan',
	name: '9盘',
	host: 'www.9pan.net',

	onStart: function () {
		if ( /\/\d/.test ( location.pathname ) ) {
			location.pathname = location.pathname.replace ('/', '/down-');
		}
	}
},
/* Compiled from dl.baidu.js */
{
	id: 'dl.baidu',
	name: '百度盘免下载管家',
	host: ['yun.baidu.com', 'pan.baidu.com'],

	onBody: function () {
		H.waitUntil ('require', function () {
			unsafeExec (function () {
				var service = require ('common:widget/commonService/commonService.js');
				service.getWidgets ('common:widget/downloadManager/service/downloadCommonUtil.js', function (util) {
					util.isPlatformWindows = function () { return false; };
				});
			});
		});
	}
},
/* Compiled from dl.bx0635.js */
{
	id: 'dl.bx0635',
	name: '暴雪盘',
	hide: '#b2>:not(#down_box), .tit + div, .clear+div, .logo_r',
	host: 'bx0635.com',
	onStart: function () {
		unsafeWindow.open = null;
	}
},
/* Compiled from dl.colafile.js */
{
	id: 'dl.colafile',
	name: '可乐盘',
	host: 'colayun.com',
	hide: [
		'.table_right', '#down_link3', '.tui', '.ad1 > .ad1 > *:not(.downbox)',

		// 计时下载页的广告
		'.hotrec-ele', '.viewshare-copy-outer'
	],
	genDigit: function () {
		return Math.ceil(Math.random() * 255);
	},
	genValidIp: function () {
		return [0,0,0,0].map(this.genDigit).join('.');
	},
	onBody: function () {
		var file_id = location.pathname.match(/\d+/)[0];

		$.ajax({
			url: '/ajax.php?action=downaddress&file_id=' + file_id,
			headers: {
				'X-Forwarded-For': this.genValidIp()
			},
			dataType: 'text'
		}).success (function (r) {
			var $dl = r.match (/downloadFile\("(.+?)"/)[1].replace('/dl.php', '/td.php');
			var linkText = H.sprintf('%s 专用下载', H.scriptName);

			// 新版
			$('<a>').addClass ('new-dbtn')
				.attr ('href', $dl)
				.append ($('<em>').addClass ('icon-download'))
				.append ($('<b>').text (linkText))
				.appendTo ($('.slide-header-funcs'));

			// 旧版
			$('<a>').addClass ('button btn-green')
				.attr ('href', $dl)
				.append ($('<i>').addClass ('icon'))
				.append (linkText)
				.appendTo ($('#down_verify_box > li'))
				.css ({
					width: 300,
					margin: '2em 0'
				});
		});
	}
},
/* Compiled from dl.ctdisk.js */
{
	id: 'dl.ctdisk',
	name: '城通网盘系列',
	host: [
		'400gb.com', 'ctdisk.com', 'pipipan.com', 'bego.cc',
		'ctfile.com', 't00y.com'
	],
	path: '/file/',
	hide: ['.captcha', '.kk_xshow', 'div.span6:first-child', '#top > .alert'],

	onBody: function () {
		// Fix Anti-ABP as it doesn't check the code.
		H.waitUntil ('guestviewchkform', function () {
			unsafeExec(function () {
				window.guestviewchkform = function (form) {
					return form.randcode && form.randcode.value.length == 4;
				};
			});
		});

		var keyForm = document.user_form;
		var $kf = $(keyForm);
		
		try {
			keyForm.hash_key.value = H.base64Decode(keyForm.hash_info.value);
		} catch (e) {
			H.info ('缺失或无效的 hash_key 属性值, 跳过…');
		}

		$kf.attr('action', $kf.attr('action').replace(/(V)\d/i, '$12'));

		$('.captcha_right').css('float', 'left');
		
		/* 城通现在的验证码是混合数字、字母
		$('#vfcode:first').parent()
			.append(H.createNumPad(4, $('#randcode')[0], function () {
				$kf.submit();
				return true;
			}));
		*/

		$('#page_content')
			.attr('id', '^_^')
			.val('cproIframeu12581302|httpubmcmmbaidustaticcomcpromediasmallpng');

		H.log ('城通就绪.');
	}
},
/* Compiled from dl.dlkoo.js */
{
	id: 'dl.dlkoo',
	name: '大连生活网',
	example: 'http://www.dlkoo.com/down/6/2011/222686754.html',
	host: ['dlkoo.com'],
	path: '/down/downfile.asp',

	onStart: function () {
		document.write = null;

		Object.defineProperty(unsafeWindow, 'navigator', {
			set: function () {},
			get: function () {
				return null;
			}
		});
	},

	onBody: function () {
		var firstEl = document.body.children[0];
		if (!firstEl) firstEl = document.body;

		var firstTxt = firstEl.textContent;
		if (H.beginWith(firstTxt, '防盗链提示') || H.beginWith(firstTxt, '验证码')) {
			H.reDirWithRef(location.href);
			return ;
		} else if (H.beginWith(firstTxt, '防刷新')) {
			firstEl.style.whiteSpace = 'pre';
			firstEl.textContent += '\n\n请稍后, 5秒后自动刷新…';
			setTimeout(H.reDirWithRef, 5500, location.href);
			return ;
		}

		var btnDl = document.getElementById('btsubmit');
		if (btnDl) {
			btnDl.id = null;
			btnDl.value = '开始下载';
			btnDl.disabled = false;

			var fakeBtn = document.createElement('input');
			fakeBtn.id = 'btsubmit';
			$(fakeBtn).hide().appendTo('body');
		}
	}
},
/* Compiled from dl.howfile.js */
{
	id: 'dl.howfile',
	name: '好盘',
	host: 'howfile.com',
	
	hide: ['#floatdiv div', '.row1_right'],
	css : '#floatdiv { top: 150px; z-index: 99999; display: block !important; }'
},
/* Compiled from dl.lepan.cc.js */
{
	id: 'cc.lepan',
	name: '乐盘自动下载地址',
	host: ['www.lepan.cc', 'www.sx566.com'],
	noSubHost: true,
	show: '#down_box',
	hide: ['.widget-box', 'a[href="vip.php"]'],
	onStart: function () {
		// 破坏广告
		Object.defineProperty(unsafeWindow, 'google', {
			set: function () { },
			get: function () { throw new Error(); }
		});
		
		Object.defineProperty(unsafeWindow, 'adsbygoogle', {
			set: function () { },
			get: function () { throw new Error(); }
		});
		
		H.rule.exec('phpdisk.z', 'onStart');
	},
	onBody: function () {
		$('#down_box .widget-box').removeClass('widget-box');
		$('[href*="down.lepan.cc/?downurl"]').each(function(i, el){
			el.removeAttribute('onclick');
			GM_xmlhttpRequest({
				method: "GET",
				url: el.href,
				onload: function (r) {
					var url = r.responseText.match(/delayURL\("(.+?)"/)[1];
					console.info('Fix link to %s', url);
					el.href = url;
				}
			});
		});
	}
}
,
/* Compiled from dl.rayfile.js */
{
	id: 'dl.rayfile',
	name: '飞速网',
	host: 'rayfile.com',
	hide: ['div.left'],

	onBody: function () {
		if (unsafeWindow.vkey) {
			location.pathname += unsafeWindow.vkey;
		} else {
			unsafeWindow.filesize = 100;
			unsafeWindow.showDownload ();
			unsafeWindow.showDownload = eFunc;
			
			$('#downloadlink').addClass('btn_downNow_zh-cn');
			$('#vodlink').addClass('btn_downTools_zh-cn');
		}
	}
},
/* Compiled from dl.sudupan.js */
{
	id: 'dl.sudupan',
	name: '速度盘',
	host: ['sudupan.com'],
	show: ['#sdpxzlj', '#sdpxzlj > td'],
	onStart: function () {
		if (H.beginWith(location.pathname, '/down_')) {
			location.pathname = location.pathname.replace ('/down_', '/sdp/xiazai_');
		}
	}
},
/* Compiled from dl.vdisk.js */
{
	id: 'dl.vdisk',
	name: '威盘',
	host: ['vdisk.cn'],
	hide: ['#loadingbox', '#yanzhengbox', '#yzmbox', '#getbox > .btn:first-child'],
	show: ['#btnbox']
},
/* Compiled from dl.yimuhe.js */
{
	id: 'dl.yimuhe',
	name: '一木禾网盘',
	host: 'yimuhe.com',

	hide: ['#loading', '.ggao', '.kuan'],
	show: ['#yzm'],

	onStart: function () {
		H.phpDiskAutoRedir();
	},

	onBody: function () {
		if (H.beginWith ( location.pathname, '/n_dd.php' )) {
			H.reDirWithRef($('#downs').attr('href'));
			return ;
		}

		var dlContainer = document.getElementById ('download');
		if (!dlContainer) return ;

		// 当下载框的 style 属性被更改后, 模拟下载按钮单击.
		var mo = new MutationObserver (function () {
			$('a', dlContainer)[1].click();
		});
		mo.observe (dlContainer, { attributes: true });

		$('#yzm>form')
			.append(H.createNumPad(4, '#code', function () {
				document.yzcode.Submit.click();
				return true;
			}, function () {
				$('#vcode_img')[0].click();
			}));
	}
},
/* Compiled from fm.douban.js */
{
	id: 'fm.douban',
	name: '豆瓣电台',
	host: 'douban.fm',
	noSubHost: true,
	css: /* Resource: fm.douban.dl.css */
H.extract(function () { /*
a#jx_douban_dl {
	background: #9DD6C5;
	padding: 3px 5px;
	color: #fff
}

a#jx_douban_dl:hover {
	margin-left: 5px;
	padding-left: 10px;
	background: #BAE2D6;
}

div#jx_douban_dl_wrap {
	float: right;
	margin-top: -230px;
	margin-right: -32px;
	font-weight: bold;
	font-family: 'Microsoft JHengHei UI', '微软雅黑', serif-sans;
}
*/}),

	// 参考代码 豆藤, USO: 49911
	onBody: function () {
		var linkDownload = $('<a>').css(H.makeDelayCss())
			.attr ('target', '_blank')
			.attr ('id', 'jx_douban_dl')
			.text ('下载');

		$('<div>')
			.attr ('id', 'jx_douban_dl_wrap')
			.append(linkDownload)
			.insertAfter('.player-wrap');
		
		H.log ('等待豆瓣电台加载 ..');
		
		H.waitUntil('extStatusHandler', function () {
			H.log ('绑定函数 ..');
			unsafeOverwriteFunctionSafeProxy ({
				extStatusHandler: function (jsonSongObj) {
					var songObj = JSON.parse(jsonSongObj);
					if ('start' == songObj.type && songObj.song) {
						linkDownload
							.attr('href', H.uri (songObj.song.url, songObj.song.title + songObj.song.url.slice(-4)))
							.attr('title', '下载: ' + songObj.song.title);
						
						H.info ('%s => %s', songObj.song.title, songObj.song.url);
					}

					throw new ErrorUnsafeSuccess ();
				}
			});

			H.log ('函数绑定完毕, Enjoy~');
			
		});
	}
},
/* Compiled from fm.jing.js */
{
	id: 'fm.jing',
	name: 'Jing.fm',
	host: 'jing.fm',
	noSubHost: true,

	onStart: function () {
		this.dlBox = $('<a>').css({
			position: 'absolute',
			right: 0,
			zIndex: 9
		}).attr('target', '_blank').text('下载');

		H.jPlayerPatcher (function (songObj) {
			this.dlBox
				.attr ( 'href', H.getFirstValue (songObj).replace(/\?.+/, '') )
				.attr ( 'title', $('#mscPlr > .tit').text () );
		}.bind (this));

		H.waitUntil ('Player.load', function () {
			unsafeOverwriteFunctionSafeProxy ({
				load: function () {
					setTimeout (function () {
						document.dispatchEvent ( new CustomEvent ('jx_jing_fm_player_loaded') );
					}, 100);

					throw new ErrorUnsafeSuccess();
				}
			}, unsafeWindow.Player, '.Player');
		});

		document.addEventListener ('jx_jing_fm_player_loaded', function () {
			H.info ('Jing.fm 播放器加载完毕');
			this.dlBox.appendTo($('#mscPlr'));
		}.bind (this), false);
	}
},
/* Compiled from fm.moe.js */
{
	id: 'fm.moe',
	name: '萌电台 [moe.fm]',
	host: 'moe.fm',
	noSubHost: true,
	hide: ['#promotion_ls'],

	onBody: function () {
		H.waitUntil('playerInitUI', function () {
			// 登录破解
			unsafeWindow.is_login = true;
			
			var dlLink = $('<a>').addClass('player-button left').css(H.makeRotateCss(90)).css({
				'width': '26px',
				'background-position': '-19px -96px'
			}).insertAfter ($('div.player-button.button-volume').first());
			
			unsafeOverwriteFunctionSafeProxy ({
				playerInitUI: function (songObj) {
					dlLink.attr('href', songObj.completeUrl).attr('title', '单击下载: ' + songObj.title);
					throw new ErrorUnsafeSuccess();
				}
			});
		});
	}
},
/* Compiled from fm.qq.js */
{
	id: 'fm.qq',
	name: 'QQ 电台下载解析',
	host: 'fm.qq.com',
	noSubHost: true,
	onBody: function () {
		H.log ('Waiting for fmQQ...');
		H.waitUntil('$.qPlayer.player.playUrl', function () {
			H.log ('fmQQ Hook start!');
			
			// CreateDLButton
			var dlLink = $('<a>').css(H.makeRotateCss(90)).css({
				'background-position': '-24px -73px'
			});
			$('.btn_del').after(dlLink);
			
			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlLink
					.attr('href', H.uri(songObj.songurl, songObj.msong + '.mp3'))
					.attr('title', '下载: ' + songObj.msong);
			}, false);

			unsafeExec (function () {
				var _playurl = window.$.qPlayer.player.playUrl.bind(window.$.qPlayer.player);
				var _updateUrl = function () {
					document.dispatchEvent ( new CustomEvent (H.scriptName, {detail: $.qPlayer.playList.getSongInfoObj() }) );
				}
				window.$.qPlayer.player.playUrl = function () {
					_updateUrl ();
					return _playurl.apply (0, arguments);
				};

				_updateUrl ();
			});

			H.log ('fmQQ Hook finish!');
		});
	}
},
/* Compiled from music.163.coffee */
({

  /*
  	网易音乐下载解析 By Jixun
  	尝试使用 Coffee Script 写
   */
  id: 'music.163',
  name: '网易音乐下载解析',
  host: 'music.163.com',
  noSubHost: true,
  noFrame: false,
  dl_icon: true,
  css: /* Resource: com.163.music.dl.css */
H.extract(function () { /*
.m-pbar, .m-pbar .barbg {
	width: calc( 455px - 2.5em );
}

.m-playbar .play {
	width: calc( 570px - 2.5em );
}

.m-playbar .oper {
	width: initial;
}

.jx_dl:hover {
	color: white;
}

-- 底部单曲下载
.m-playbar .oper .jx_dl {
	text-indent: 0;
	font-size: 1.5em;
	margin: 13px 2px 0 0;
	float: left;
	color: #ccc;
	text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em #aaa;
}

.jx_dl:hover {
	color: white;
}

-- 播放列表下载
.m-playbar .listhdc .jx_dl.addall {
	left: 306px;
	line-height: 1em;
	-- 多一个 px, 对齐文字
	top: 13px;
}

.m-playbar .listhdc .line.jx_dl_line {
	left: 385px;
}
*/}),
  onStart: function() {
    this.regPlayer();
    return unsafeExec(function() {
      var fakePlatForm;
      fakePlatForm = navigator.platform + "--Fake-mac";
      Object.defineProperty(navigator, "platform", {
        get: function() {
          return fakePlatForm;
        },
        set: function() {
          return null;
        }
      });
      return window.GRestrictive = false;
    });
  },
  _doRemoval: function() {
    return H.waitUntil('nm.x', (function(_this) {
      return function() {
        var hook1, hook2;
        hook1 = _this.searchFunction(unsafeWindow.nej.e, 'nej.e', '.dataset;if');
        hook2 = _this.searchFunction(unsafeWindow.nm.x, 'nm.x', '.copyrightId==');
        return H.waitUntil('nm.x.' + hook2, function() {
          return unsafeExec(function(bIsFrame, hook1, hook2) {
            var _bK;
            _bK = nej.e[hook1];
            nej.e[hook1] = function(z, name) {
              if (name === 'copyright' || name === 'resCopyright') {
                return 1;
              }
              return _bK.apply(this, arguments);
            };
            return nm.x[hook2] = function() {
              return false;
            };
          }, H.isFrame, hook1, hook2);
        }, 7000, 500);
      };
    })(this));
  },
  searchFunction: function(base, name, key) {
    var baseName, fn, fnStr;
    for (baseName in base) {
      fn = base[baseName];
      if (fn && typeof fn === 'function') {
        fnStr = String(fn);
        if (fnStr.indexOf(key) !== -1) {
          H.info('Search %s, found: %s.%s', key, name, baseName);
          return baseName;
        }
      }
    }
    H.info('Search %s, found nothing.', key);
    return null;
  },
  regPlayer: function() {
    return document.addEventListener(H.scriptName, (function(_this) {
      return function(e) {
        var songObj;
        songObj = e.detail;
        return _this.linkDownload.attr({
          href: H.uri(_this.getUri(JSON.parse(songObj.song)), "" + songObj.name + " [" + songObj.artist + "].mp3"),
          title: '下载: ' + songObj.name
        });
      };
    })(this));
  },
  hookPlayer: function() {
    H.waitUntil('nm.m.f', (function(_this) {
      return function() {
        var baseName, clsFn, playerHooks, protoName, _ref;
        playerHooks = null;
        _ref = unsafeWindow.nm.m.f;
        for (baseName in _ref) {
          clsFn = _ref[baseName];
          protoName = _this.searchFunction(clsFn.prototype, "nm.m.f." + baseName, '<em>00:00</em>');
          if (protoName) {
            playerHooks = [baseName, protoName];
            break;
          }
        }
        unsafeExec(function(scriptName, playerHooks) {
          var _bakPlayerUpdateUI;
          _bakPlayerUpdateUI = nm.m.f[playerHooks[0]].prototype[playerHooks[1]];
          nm.m.f[playerHooks[0]].prototype[playerHooks[1]] = function(songObj) {
            var eveSongObj;
            eveSongObj = {
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
        }, H.scriptName, playerHooks);
      };
    })(this));
  },
  hookPlayerFm: function() {
    return H.waitUntil('nm.m.fO', (function(_this) {
      return function() {
        var hook;
        hook = _this.searchFunction(unsafeWindow.nm.m.fO.prototype, 'nm.x', '.mp3Url,true');
        _this.linkDownload = $('<a>').prependTo('.opts.f-cb>.f-fr').addClass('icon icon-next').html('&nbsp;').css('transform', 'rotate(90deg)');
        unsafeExec(function(scriptName, hook) {
          var _bakPlaySong;
          _bakPlaySong = nm.m.fO.prototype[hook];
          nm.m.fO.prototype[hook] = function(songObj) {
            var eveSongObj;
            eveSongObj = {
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
      };
    })(this));
  },
  onBody: function() {
    this._doRemoval();
    if (H.isFrame) {
      return;
    }
    this.linkDownload = $('<a>').addClass(H.defaultDlIcon).appendTo($('.m-playbar .oper')).attr({
      title: '播放音乐, 即刻解析'
    }).click(function(e) {
      e.stopPropagation();
    });
    this.linkDownloadAll = $('<a>').addClass(H.defaultDlIcon).addClass('addall').text('全部下载').attr({
      title: '下载列表里的所有歌曲'
    }).click((function(_this) {
      return function(e) {
        e.stopPropagation();
        (function(trackQueue, aria2) {
          var i, track, _ref;
          _ref = JSON.parse(trackQueue);
          for (i in _ref) {
            track = _ref[i];
            aria2.add(Aria2.fn.addUri, [_this.getUri(track)], H.buildAriaParam({
              out: "" + i + ". " + track.name + " [" + (track.artists.map(function(artist) {
                return artist.name;
              }).join('、')) + "].mp3"
            }));
          }
          aria2.send(true);
        })(localStorage['track-queue'], new Aria2.BATCH(H.aria2, function() {
          return H.info(arguments);
        }));
      };
    })(this));
    if (H.config.dUriType === 2) {
      H.captureAria(this.linkDownload);
    } else {
      this.linkDownloadAll.addClass('jx_hide');
    }
    H.waitUntil(function() {
      return $('.listhdc > .addall').length;
    }, (function(_this) {
      return function() {
        _this.linkDownloadAll.insertBefore($('.m-playbar .listhdc .addall')).after($('<a>').addClass('line jx_dl_line'));
      };
    })(this), true, 500);
    if (location.pathname === '/demo/fm') {
      return this.hookPlayerFm();
    } else {
      return this.hookPlayer();
    }
  },
  dfsHash: (function() {
    var strToKeyCodes;
    strToKeyCodes = function(str) {
      return Array.prototype.slice.call(String(str).split('')).map(function(e) {
        return e.charCodeAt();
      });
    };
    return function(dfsid) {
      var fids, key;
      key = [51, 103, 111, 56, 38, 36, 56, 42, 51, 42, 51, 104, 48, 107, 40, 50, 41, 50];
      fids = strToKeyCodes(dfsid).map(function(fid, i) {
        return (fid ^ key[i % key.length]) & 0xFF;
      });
      return CryptoJS.MD5(CryptoJS.lib.ByteArray(fids)).toString(CryptoJS.enc.Base64).replace(/\//g, "_").replace(/\+/g, "-");
    };
  })(),
  getUri: function(song) {
    var dsfId, randServer;
    dsfId = (song.hMusic || song.mMusic || song.lMusic).dfsId;
    randServer = Math.floor(Math.random() * 2) + 1;
    return "http://m" + randServer + ".music.126.net/" + (this.dfsHash(dsfId)) + "/" + dsfId + ".mp3";
  }
}),
/* Compiled from music.1ting.js */
{
	id: 'music.1ting',
	name: '一听音乐',
	host: ['www.1ting.com'],
	noSubHost: true,
	path: ['/player/', '/album_'],

	onBody: function () {
		this.dlBtn = $('.songact a.down')
			.text ('直接下载')
			.removeAttr('onclick');

		H.waitUntil ('yiting.player.entity.src', function () {
			unsafeExec (function () {
				var playTrigger = function () {
					// dlBtn.attr('href', window.yiting.player.entity.src);
					document.dispatchEvent ( new CustomEvent (H.scriptName) );
				};

				window.yiting.player.hook('play', playTrigger);
				playTrigger ();
			});
		});

		document.addEventListener (H.scriptName, this.eventHandler.bind (this), false);
		this.eventHandler ();
	},

	eventHandler: function () {
		var songTitle = $('.song .songtitle > a').text ();
		this.dlBtn.attr ({
			href: H.uri (unsafeWindow.yiting.player.entity.src, songTitle + '.mp3'),
			title: '下载: ' + songTitle
		});
	}
},
/* Compiled from music.565656.js */
{
	id: 'music.565656',
	name: '565656 音乐',
	host: 'www.565656.com',
	noSubHost: true,
	path: ['/plus/player.ashx', '/ting/'],

	onStart: function () {
		H.jPlayerPatcher (function (songObj) {
			var songAddr = songObj.mp3 || songObj.m4a;
			$('.play-info-otheropt > a:last')
				.attr('href', H.uri (songAddr, songObj.songname + songObj.m4a.slice(-4)))
				.find('span').text('下载: ' + songObj.songname + ' - ' + songObj.singername);
		});
	}
},
/* Compiled from music.5sing.js */
{
	id: 'music.5sing',
	name: '5sing 下载解析',
	host: ['5sing.com', '5sing.kugou.com'],

	onStart: function () {
		if (H.beginWith(location.pathname, '/fm/')) {
			// e.g. http://5sing.kugou.com/fm/m/
			this._fmHook ();
		}
	},

	onBody: function () {
		if (H.contains(location.pathname, '/down/')) {
			this._dlPage ();
			return ;
		}

		// 旧版单曲播放页面
		H.waitUntil ('pageOptions.ticket', function () {
			var songObj = JSON.parse(H.base64Decode(unsafeWindow.pageOptions.ticket));
			$('.func_icon3>a').attr ({
				href: H.uri(songObj.file, songObj.songName + '.mp3'),
				title: '单击下载: ' + songObj.songName,
			}).html('<b/>直链下载');

			$('#play').css ({
				top: 'initial'
			});
			$('.song_play').css ({
				marginTop: '1em'
			});
			$('.rt2').hide();
			$('#report').parent().hide();
		});

		// 新版单曲播放页面
		H.waitUntil ('globals.ticket', function () {
			var songObj = JSON.parse(H.base64Decode(unsafeWindow.globals.ticket));
			$('.view_info>ul:last>li:first').replaceWith($('<li>').append (
				$('<a>').text('点我下载').attr({
					href: H.uri(songObj.file, songObj.songName + '.mp3'),
					title: '单击下载: ' + songObj.songName,
					target: '_blank'
				}).css ('color', '#F87877')
			));
		});
	},

	_dlPage: function () {
		var $dl = $('<p>').prependTo ($('.sing_view')).text('正在解析音乐地址…');

		$.get($('.main > h1 > a').attr('href')).success (function (res) {
			var songAddress = res.match(/"ticket"\s*:\s*\"(.+?)"/);
			if (songAddress) {
				var songObj = JSON.parse(H.base64Decode(songAddress[1]));
				songAddress = H.uri(songObj.file, songObj.songName + '.mp3');
			} else if (songAddress = res.match(/,\s*file\s*:\s*\"(.+?)"/)) {
				// 来源请求
				songAddress = songAddress[1];
			} else {
				$dl .text ('* 下载解析失败，请访问歌曲页解析。')
					.css ('color', 'red');
				return ;
			}

			$dl.text('解析完毕: ').append ($('<a>').attr({
				href: songAddress,
				target: '_blank'
			}).text('点我下载'));
		}).error (function () {
			$dl .text ('* 网络错误，请稍候重试或访问歌曲页解析。')
				.css ('color', 'red');
		});
	},

	_fmHook: function () {
		if (this.fmHooked) return ;
		this.fmHooked = true;

		H.hookDefine ('define', function (scriptName, _define, moduleName, requires, fCallback) {
			if ('player/single' === moduleName) {
				return _define (moduleName, requires, function (require, exports, module) {
					var ret = fCallback.call (null, require, exports, module);

					var $wsp = module.exports;
					var MediaElement = $wsp.mediaElement;
					$wsp.mediaElement = function (playerBoxId, options) {
						options.stats.enable = false;
						var mPlayer = new MediaElement (playerBoxId, options);
						var _play = mPlayer.play;
						mPlayer.play = function (songObj) {
							document.dispatchEvent ( new CustomEvent (scriptName, {detail: songObj}) );
							return _play.call (mPlayer, songObj);
						};
						return mPlayer;
					};
					return ret;
				});
			}
		}, H.scriptName);

		document.addEventListener (H.scriptName, function (e) {
			var songObj = e.detail;
			setTimeout (function () {
				$('.jp-download').attr ({
					href: H.uri(songObj.file, songObj.songName + '.mp3'),
					title: '下载: ' + songObj.songName
				});
			}, 1);
		}, false);
	},

},
/* Compiled from music.9ku.js */
{
	id: 'music.9ku',
	name: '9酷音乐',
	host: 'www.9ku.com',
	noSubHost: true,
	hide: ['#LR2', '#LR3', '#seegc', '.dongDown'],
	path: ['/play/', '/play.htm'],

	onStart: function () {
		this.dlLink = $('<a>')
			.attr ('target', '_blank')
			.attr ('title',  '正在抓取歌曲数据 ..')
			.text ('下载');

		H.jPlayerPatcher (function (songObj) {
			var songUrl  = songObj.mp3 || songObj.m4a,
				songName = $('#play_musicname').text();

			this.dlLink
				.attr ('href', H.uri (songUrl, songName + songUrl.slice(-4)))
				.attr ('title', '下载: ' + songName);
		}.bind (this));
	},

	onBody: function () {
		$('.ringDown').css ({
			float: 'none',
			display: 'block',
			textAlign: 'center'
		}).html (this.dlLink);
	}
},
/* Compiled from music.baidu.js */
{
	id: 'music.baidu',
	name: '百度音乐',
	host: 'music.baidu.com',
	noSubHost: true,
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
		this.parser = H.rule.get ('music.baidu.play');
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
},
/* Compiled from music.baidu.play.js */
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
			text: H.extract(function () {/*
请挂上*大陆*马甲, 因其它地区访问被屏蔽.

如果您会使用相关插件, 请加入下述地址至规则:  
http://music.baidu.com/data/user/collect?*  

您可以按下 Ctrl+C 拷贝该消息.

相关阅读: https://github.com/JixunMoe/cuwcl4c/wiki/配合大陆代理实现访问解除封锁
*/}),
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
							isFav:      !!e.hasCollected
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
			qRemoveFav.done(isFav ? H.nop : function () {
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

				H.addDownload (self._renameUrl(url, file), file);
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
},
/* Compiled from music.baidu.yinyueyun.js */
{
	id: 'music.baidu.yinyueyun',
	name: '音乐云下载',
	host: 'yinyueyun.baidu.com',
	noSubHost: true,
	path: '/',

	onStart: function () {
		H.waitUntil('userModel.set', function () {
			unsafeExec(function (scriptName, hookBatch) {
				var bakUserSetInfo = userModel.set;
				userModel.set = function (key, val, opts) {
					if (key === 'userInfo' && val) {
						val.vip = val.golden = true;
					}
					return bakUserSetInfo.apply(userModel, arguments);
				};
				
				// Force update user data via hook
				userModel.set('userInfo', userModel.get('userInfo'));
			});
		});
	}
},
/* Compiled from music.djcc.js */
{
	id: 'music.djcc',
	name: 'DJCC 舞曲',
	host: ['www.djcc.com'/* , 'www.dj.cc' */],
	noSubHost: true,

	path: ['/dj/', '/play.php'],
	missingDomain5: 'http://down.djcc.com/music/',

	onStart: function () {
		H.waitUntil ('$.post', function () {
			console.info ('执行 VIP 破解 (play.php 页面无效) ..');
			unsafeExec (function (scriptHome, scriptName) {
				console.info (scriptHome);
				var _post = $.post;
				$.post = function (addr, cb) {
					if (addr == '/ajax.php?ajax=userinfo') {
						return _post.call (window.$, addr, function (s) {
							if (s == '')
								s = [1, scriptName, 0, scriptHome, 0, 0,
									99999999, 99999999, 0, 0, 2, '尊贵的 ' + scriptName + ' 用户', '9年'].join('*wrf*');

							cb (s);
						});
					}
					return _post.apply (window.$, arguments);
				};

				return function () {};
			}, H.scriptHome, H.scriptName);
		});

		// 播放器劫持
		H.waitUntil ('jwplayer.api', function () {
			unsafeExec (function () {
				var _sp = window.jwplayer.api.selectPlayer;
				window.jwplayer.api.selectPlayer = function (sel) {
					var mPlayer = _sp (sel);
					var _setup = mPlayer.setup;
					mPlayer.setup = function (options) {
						console.info ('setup', options);
						var _opl = options.events.onPlaylistItem;
						options.events.onPlaylistItem = function (eventPlaylistChange) {
							document.dispatchEvent ( new CustomEvent (H.scriptName, {detail: JSON.stringify (mPlayer.getPlaylistItem ())}) );
							return _opl.apply (this, arguments);
						};

						return _setup.apply (mPlayer, arguments);
					};
					return mPlayer;
				};
			});
		});

		this.dlLink1 = $('<a>').text ('试听下载').attr ('target', '_blank');
		this.dlLink2 = $('<a>').text ('高清下载').attr ('target', '_blank');

		// 下载数据解析
		document.addEventListener (H.scriptName, function (e) {
			var songObj = JSON.parse (e.detail);
			if (H.beginWith (songObj.file, wrfJw.Player.domain[0]))
				songObj.file = songObj.file.slice (wrfJw.Player.domain[0].length);

			this.dlLink1.attr ('href', H.uri (wrfJw.Player.domain[0] + songObj.file , songObj.title + '.mp3'));
			this.dlLink2.attr ('href', H.uri (missingDomain5 + (songObj.file2 || songObj.file), songObj.title + '.高清.mp3'));
			H.info (songObj);
		}.bind(this), false);
	},

	onBody: function () {
		$('#listtabs')
			.append (this.dlLink1)
			.append (this.dlLink2)
			.css ('height', 'initial')
			.css ('min-height', '160');
	}
},
/* Compiled from music.djkk.js */
{
	id: 'music.djkk',
	name: 'DJ 嗨嗨',
	host: 'www.djkk.com',
	noSubHost: true,
	css: /* Resource: com.djkk.dl.css */
H.extract(function () { /*
#jx_dl_wrapper {
    float: right;
    margin-right: 1.5em;
}

#jx_dl_wrapper > a {
	transition: color .4s;
	color: #aaa;
}

#jx_dl_wrapper > a:hover {
	color: #fff;
	text-decoration: none;
}
*/}),

	onStart: function () {
		this.dlHolder = $('<div id="jx_dl_wrapper">');
		this.dlLink   = $('<a>').text('下载').appendTo (this.dlHolder);

		H.jPlayerPatcher (function (songObj) {
			var songAddr  = songObj.mp3 || songObj.m4a;
			var songTitle = songObj.title || $('#playTitle .jp-title').text().replace(/.+：/, '');
			
			this.dlLink
				.attr ('href', H.uri(songAddr, songTitle + songAddr.slice(-4)) )
				.attr ('title', '下载: ' + songTitle);
		}.bind (this));
	},

	onBody: function () {
		this.dlHolder.appendTo ($('.main-panel'));
	}
},
/* Compiled from music.djye.js */
{
	id: 'music.djye',
	name: 'DJ 爷爷网',
	host: 'www.djye.com',
	noSubHost: true,
	path: '/Player/',
	css : /* Resource: com.djye.dl.css */
H.extract(function () { /*
#jx_dl_btn {
	margin-top: 7px;
	float: right;
}

#jx_dl_btn > a {
	transition: color .4s;
	color: black;
}

#jx_dl_btn > a:hover {
	color: #444;
}
*/}),

	toMp3: function (song) {
		return song.replace(/[a-z]*\./, 'mp3.').replace(/m4a$/, 'mp3?type=down');
	},

	onStart: function () {
		this.linkHolder = $('<p id="jx_dl_btn">');
		this.linkM4A = $('<a>').appendTo (this.linkHolder).text ('试听音质');
		this.linkHolder.append (' | ');
		this.linkMP3 = $('<a>').appendTo (this.linkHolder).text ('MP3')
			.attr ('title', '请注意: 该链接可能因为服务器配置更新导致无法下载');

		H.jPlayerPatcher (function (songObj) {
			var songLink = songObj.m4a.replace(/\?.*/, '');
			var songTitle = $('#play_title').text ();

			this.linkM4A.attr('href', H.uri (songLink, songTitle + '.m4a'));
			this.linkMP3.attr('href', H.uri (this.toMp3(songLink), songTitle + '.mp3'));
		}.bind (this));
	},

	onBody: function () {
		this.linkHolder
			.appendTo ($('.playerMain-03'))
			.prev().css('padding-left', 25);
	}
},
/* Compiled from music.duole.js */
{
	id: 'music.duole',
	name: '多乐音乐',
	host: 'www.duole.com',
	noSubHost: true,

	onBody: function () {
		var btnPrevSong = $('#player_right .last'),
			btnDownload = btnPrevSong.clone();
		
		$('#player_right').animate({
			'width': '+=32'
		}, 500);
		
		var songInfo = $('a.music_info').css({
			'cursor': 'text'
		}).removeAttr('href');


		var mo = new MutationObserver (function () {
			if (songInfo[0].hasAttribute('href'))
				songInfo.removeAttr ('href');
		}.bind (this));
		mo.observe (songInfo[0], {
			attributes: true
		});

		btnDownload.insertBefore(btnPrevSong.prev()).removeClass('last').css({
			'width': '0',
			'display': 'inline',
			'background-position': '-150px -104px'
		}).css(H.makeRotateCss(90)).animate({
			'width': '+=32'
		}, 500).attr('target', '_blank');
		
		var oldPlayNew = unsafeWindow.duolePlayer.playNew;
		var randomId;

		unsafeOverwriteFunctionSafeProxy ({
			playNew: (function (t, n) {
				document.dispatchEvent (
					new CustomEvent (H.scriptName, {detail: JSON.stringify ({
						mp3: t,
						info: this.curMusic
					})})
				);

				throw new ErrorUnsafeSuccess ();
			}).bind(unsafeWindow.duolePlayer)
		}, unsafeWindow.duolePlayer, '.duolePlayer');

		document.addEventListener (H.scriptName, function (e) {
			var songObj  = JSON.parse (e.detail),
				songInfo = songObj.info;

			btnDownload.attr({
				href: H.uri (songObj.mp3, songInfo.song_name + ' [' + songInfo.album_name + '] - ' + songInfo.singer_name + '.mp3'),
				title: '单击下载: ' + songInfo.song_name
			});
		}, false);
	}
},
/* Compiled from music.duomi.ear.js */
{
	id: 'music.duomi.ear',
	name: '邻居的耳朵',
	host: 'ear.duomi.com',
	noSubHost: true,
	onBody: function () {
		H.wordpressAudio ();
	}
},
/* Compiled from music.oyinyue.js */
{
	id: 'music.oyinyue',
	name: '噢音乐下载解析',
	host: 'oyinyue.com',

	onBody: function () {
		if (H.beginWith (location.pathname, '/Down.aspx')) {
			this.downPage ();
			return ;
		}

		H.waitUntil ('player.setUrl', function () {
			unsafeOverwriteFunctionSafeProxy ({
				setUrl: function (songUrl) {
					$('.func_icon4 > a').attr({
						'href': songUrl,
						'target': '_blank'
					}).html('<b/>直链下载');

					throw new ErrorUnsafeSuccess ();
				}
			}, unsafeWindow.player, '.player')
		});
	},

	downPage: function () {
		var $dl = $('<p>').prependTo ($('.sing_view')).text('正在解析音乐地址…');
		this.fetch ($_GET.id, function (songUrl) {

			$dl.text('解析完毕: ').append ($('<a>').attr({
				href: songUrl,
				target: '_blank'
			}).text('点我下载'));

		}, function () {
			$dl.text ('* 下载解析失败，请访问歌曲页解析。')
				.css ('color', 'red');
		});
	},

	fetch: function (songId, successCallback, failCallback) {
		$.ajax ({
			url: '/load/loadsong.ashx',
			method: 'POST',
			data: {
				songid: songId,
				id: 3
			},
			dataType: 'text'
		}).success (function (url) {
			if (url && url != '0') {
				successCallback (url);
			} else {
				failCallback ();
			}
		}).error (function () {
			failCallback ();
		});
	}
},
/* Compiled from music.qq.iplimit.js */
{
	id: 'music.qq.iplimit',
	name: 'QQ 音乐、电台海外访问限制解除',
	host: ['y.qq.com', 'fm.qq.com'],
	onBody: function () {
		H.info ('等候海外访问限制模组加载…');
		H.waitUntil ('MUSIC.widget.main.IP_limit.isLimit', function () {
			H.info ('海外访问限制解除.');
			unsafeOverwriteFunction ({
				// 解除「QQ音乐暂时不能对您所在的国家或地区提供服务」限制
				isLimit: function () {}
			}, unsafeWindow.MUSIC.widget.main.IP_limit, '.MUSIC.widget.main.IP_limit');
		});
	}
},
/* Compiled from music.qq.y.js */
{
	id: 'music.qq.y',
	name: 'QQ 音乐下载解析',
	host: ['y.qq.com', 'soso.music.qq.com'],
	noSubHost: true,

	css: /* Resource: com.qq.y.dl.css */
H.extract(function () { /*
@media screen {
	.m_player .bar_op {
		left:  208px;
		width: 310px;
	}

	.jx_dl_bt {
		transform: rotate(90deg);
	}

	.jx_dl_bt > a {
		width:   100%;
		height:  100%;
		display: block;
		outline: 0 !important;
	}
}

*/}),
	onBody: function () {
		if (H.config.dUriType == 1) {
			H.warn (
				'%s\n%s',
				'当前版本的协议尚未支援 Cookie 输入, 回滚至连接版',
				'如果您确实需要自动填入用户名, 请改用 Aria2 版'
			);

			H.config.dUriType = 0;
		}

		var styleToFix = this.styleBlock;

		H.waitUntil ('MUSIC.module.webPlayer.interFace.getSongUrl', function () {
			H.fixStyleOrder (styleToFix);

			var dlBtn = $('<a>')
				.addClass('aria-cookie')
				.attr('title', '播放音乐, 即刻下载')
				.appendTo (
					$('<strong>')
						.addClass ('next_bt jx_dl_bt')
						.insertAfter ('.next_bt')
				);

			unsafeExec (function (scriptName) {
				var oldGetSong = window.MUSIC.module.webPlayer.interFace.getSongUrl;

				window.MUSIC.module.webPlayer.interFace.getSongUrl = function (songObj, cb) {
					document.dispatchEvent ( new CustomEvent (scriptName, {detail: {
						host: 'http://stream' + (parseInt(songObj.mstream) + 10) + '.qqmusic.qq.com/',
						path: "M800" + songObj.mmid + ".mp3",
						name: songObj.msong + '[' + songObj.msinger + ']'
					} }) );

					return oldGetSong.apply (this, arguments);
				};
			}, H.scriptName);

			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlBtn.attr ({
					href: H.uri (songObj.host + songObj.path, songObj.name + '.mp3'),
					title: '下载: ' + songObj.name
				});
			}, false);
		}, 7000, 500);

		H.waitUntil ('MUSIC.widget.trackServ.formatMusic', function () {
			unsafeExec(function () {
				var _formatMusic = MUSIC.widget.trackServ.formatMusic;
				MUSIC.widget.trackServ.formatMusic = function () {
					var _music = _formatMusic.apply(this, arguments);

					_music.mstatus = parseInt(_music.mstatus) || 1;

					_music.msize = _music.msize || 1;
					_music.minterval = _music.minterval || 1;

					if (_music.msongurl) {
						var _pre;
						if (_music.size320) {
							_pre = 'M800';
						} else if (_music.size128) {
							_pre = 'M500';
						}

						if (_pre) {
							_music.msongurl = 'http://stream' + (parseInt(_music.mstream) + 10) +
												'.qqmusic.qq.com/' + _pre + _music.mmid + '.mp3';
						}
					}

					return _music;
				};

				var getVip = g_user.getVipInfo;
				g_user.getVipInfo = function (successCb, failCb) {
					return g_user.getVipInfo (function (info) {
						if (1 != info.vip) info.vip = 1;
						if (successCb) successCb (info);
					}, failCb);
				};
			});
		}, 7000, 500);
	}
},
/* Compiled from music.songtaste.js */
{
	id: 'music.songtaste',
	name: 'SongTaste 下载解析',
	host: ['songtaste.com'],

	onBody: function () {
		var path = location.pathname;
		if (H.beginWith (path, '/album/') || H.beginWith (path, '/music/')) {
			this.album ();
		} else if (H.beginWith (path, '/song/')) {
			this.single ();
		} else if (H.beginWith (path, '/playmusic.php')) {
			this.playlist ();
		}
	},


	album: function () {
		H.log ('ST :: 专辑页面调整');
		var btn_playAll = $($('.song_fun_btn').children()[1]);
		var btn_noPopPlay = btn_playAll.clone().attr({
			'value': '当前窗口播放',
			'onclick': ''
		}).insertAfter (btn_playAll);

		btn_noPopPlay.click(function () {
			var ids = [].filter.call (unsafeWindow.chkArray, function (e) {
				return e.checked;
			}).map (function (e) {
				return e.value;
			}).join(',');

			if (!ids) {
				ids = [].map.call(unsafeWindow.chkArray, function (e) {
					return e.value;
				}).join (',');
			}

			location.href = '/playmusic.php?song_id=' + ids;
		});
	},

	single: function () {
		var args    = $("#playicon a").attr('href').replace(/\s/g, '').replace(/"/g, "'").split("'");
		var sURL    = args [05],
			sType   = args [11],
			sHead   = args [13],
			songId  = args [15],
			sLength = args [16].match (/\d{2,}/)[0];

		var q = $.Deferred();
		q.then (function (songUrl) {
			H.log ('ST :: 解析音乐地址 :: %s', songUrl);
			var songName = $('.mid_tit').text();

			$('a#custom_1').attr({
				'href': H.uri(songUrl, songName + songUrl.slice(-4)),
				'title': '下载: ' + songName
			}).text('直接下载');
		});

		if (H.contains(sURL, 'rayfile')) {
			q.resolve (sHead + sURL + unsafeWindow.GetSongType(sType));
		} else {
			$.ajax({
				type: 'POST',
				url: '/time.php',
				cache: true,
				data: 'str=' + sURL + '&sid=' + songId + '&t=' + sLength,
				dataType: 'text',
			}).success(function (r) {
				q.resolve (r);
			});
		}
	},

	playlist: function () {
		// 下载解析 - Hook 更换歌曲的函数，避免重复读取歌曲 + 不需要多次请求服务器不容易掉线。
		H.log ('ST :: 列表模式解析');

		var pDownload = $('#left_music_div > .p_fun > a:last')
			.text('直接下载')
			.attr('target', '_blank');

		unsafeOverwriteFunctionSafeProxy ({
			changeSong: function (name, url, isLogoShown) {
				// 2013.03.19 & 2013.04.09 修正:
				//   已经删除的歌曲自动跳到下一曲
				if ( 0 == name.trim().length ) {
					unsafeWindow.pu.doPlayNext(2);
					return;
				}
				H.log ('请求歌曲 :: %s :: %s', name, url);
				pDownload.attr({
					'href': H.uri(url, name + url.slice(-4)),
					'title': '下载: ' + name
				});
				document.title = 'ST - ' + name;

				// 转接给原函数
				throw new ErrorUnsafeSuccess();
			},

			delSongDiv: function (songid, isbox) {
				H.log ('删除歌曲 :: ' + songid.toString());
				$('#' + songid).hide();

				var new_songlist = [];
				for (var i = 0; i < unsafeWindow.arr_ids.length; i++) {
					if (unsafeWindow.arr_ids[i] == songid) {
						if (songid == unsafeWindow.cur_sid)
							unsafeWindow.pu.doPlayNext(1);
						unsafeWindow.arr_ids[i] = 0;
					}
				}
			}
		});

		// 2013.03.19 添加:
		//   重建播放列表地址
		$('p.p_list_txt').append($('<a>').text('重建播放列表').click(function () {
			location.search = '?song_id=' + unsafeWindow.arr_ids.join(',');
		}).css('cursor', 'pointer'));
		
		H.log ('ST :: 等待网页加载...');
		H.waitUntil ('pu.doPlayNext', function () {
			H.log ('ST :: 官方播放器删除功能修正启动');

			unsafeOverwriteFunctionSafeProxy ({
				doPlayNext: function (t) {
					var now, avl, i;
					for (i = 0; i < unsafeWindow.arr_ids.length; i++) {
						if (unsafeWindow.arr_ids[i] == unsafeWindow.cur_sid) {
							now = i;
							break;
						}
					}
					// 寻找下一首未删除的歌曲。
					//   * 2013.01.29 修正
					//	 1. 上一首查找失败的情况下会滚回到当前音乐的错误。
					//	 2. 如果没有可听歌曲情况下无限循环的错误。
					
					now = Math.abs((now || 0) + t);
					avl = 0;
					
					// 检查是否有歌曲剩余
					for (i = 0; i < unsafeWindow.arr_ids.length; i++) {
						if (unsafeWindow.arr_ids[i]) {
							avl++;
						}
					}
					if (avl === 0) {
						alert('歌都被删光了还听啥...');
						return;
					}
					
					// 寻找空位
					while (true) {
						if (unsafeWindow.arr_ids[now]) {
							H.log ('切换歌曲 :: ' + now.toString());
							unsafeWindow.pu.utils(now);
							unsafeWindow.cur_sid = unsafeWindow.arr_ids[now];
							unsafeWindow.playSongRight();
							return;
						}
						now += t >= 0 ? 1 : -1;
						if (unsafeWindow.arr_ids.length <= now) {
							now = 0;
						}
						if (now < 0) {
							now = unsafeWindow.arr_ids.length;
						}
					}
				}
			}, unsafeWindow.pu, '.pu');
		});
	}
},
/* Compiled from music.xiami.js */
{
	id: 'music.xiami',
	name: '虾米音乐',
	host: 'www.xiami.com',
	noSubHost: true,
	dl_icon: true,
	css: /* Resource: com.xiami.fm.css */
H.extract(function () { /*
-- xiami FM player css

.jx_dl {
	position: absolute;
	color: #ddd;
	right: 99px;
	width: 18px;
	height: 18px;
	font-size: 18px;
	transition: color .3s;
}

.jx_dl:hover {
	color: #aaa;
}
*/}),

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
},
/* Compiled from music.yinyuetai.js */
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
},
/* Compiled from phpdisk.a.js */
{
	id: 'phpdisk.a',
	name: '通用 phpDisk.a 网盘规则',
	// 相关规则: 跳转 /file-xxx -> /download.php?id=xxx&key=xxx
	
	host: [
		'79pan.com', '03xg.com',
		'wpan.cc', 'ypan.cc',
		
		'7mv.cc', 'pan.52zz.org', '258pan.com', 'huimeiku.com'
	],

	hide: ['#code_box', '#down_box2', '#codefrm', '.ad', '[class^="banner"]'],
	show: '#down_box',

	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});
	},
	onBody: function () {
		H.waitUntil ('down_file_link', function () {
			// 避免地址被覆盖
			unsafeWindow.update_sec = null;
			// 强制显示地址
			unsafeWindow.down_file_link ();

			// 强制显示下载地址
			if (unsafeWindow.show_down_url)
				unsafeWindow.show_down_url ('down_a1');

			var jumpUrl = $('#down_link').find('a').attr('href');

			// 然后跳过去
			if (jumpUrl) {
				H.reDirWithRef (jumpUrl);
			} else {
				alert (H.sprintf('[%s]: 应用 %s 失败:\n找不到跳转地址.', H.scriptName, this.name));
			}
		});
	}
},
/* Compiled from phpdisk.z.js */
{
	id: 'phpdisk.z',
	name: '通用 phpDisk.z 网盘规则',
	// 规则: 直接跳转 /file-xxx -> /down-xxx
	//       并隐藏 down_box2, 显示 down_box
	
	host: [
		'azpan.com', 'gxdisk.com', '2kuai.com', '1wp.me', 
		'77pan.cc', 'vvpan.com', 'fmdisk.com', 'bx0635.com',
		'10pan.cc'
	],
	hide: [
		// azpan, gxdisk
		'.Downpagebox',

		'.talk_show', '.banner_2', '.w_305',

		// 2kuai.com
		'.ad', '#vcode', '#tui', '.dcode', '#down_box2', '#dl_tips', '.nal', '.scbar_hot_td', '#incode'
	],
	show: [
		// 2kuai.com
		'#down_box', '#dl_addr'
	],
	onStart: function () {
		unsafeDefineFunction ('down_process', tFunc);
		H.phpDiskAutoRedir ();
	}
} ];

	if (H.config.bUseCustomRules) {
		try {
			[].splice.apply (sites, [0, 0].concat(eval (H.sprintf('[%s\n]', H.config.sCustomRule))));
		} catch (e) {
			H.info ('解析自定义规则时发生错误: %s', e.message);
		}
	}

	var handleSite = (function () {
		// 扩展规则函数
H.rule = {
	checkPath: function (path, rule) {
		if (rule instanceof Array) {
			if (rule.length == 0)
				return false;

			for (var i = rule.length; i--; ) {
				if (this.checkPath(path, rule[i]))
					return true;
			}

			return false;
		}

		return (
			// Function
			(rule.call && rule(path))

			// String
			|| (typeof rule == 'string' && H.beginWith (path, rule))

			// Regex match
			|| (rule instanceof RegExp && rule.test (path))

			// Failed to match anything :<
			|| false
		);
	},
	
	check: function (site, eve) {
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
		var hostMatch;
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
		if (site.path && !this.checkPath(location.pathname, site.path)) {
			return ;
		}
		
		return true;
	},

	run: function (site, event) {
		if (!site || !event)
			return ;
		
		var eve = site[event];

		if (site._styleApplied)
			// 修正 CSS 可能被覆盖的错误
			H.fixStyleOrder (site.styleBlock);

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

				H.injectStyle.call (styleBlock, H.sprintf(/* Resource: AA.dl_btn.css */
H.extract(function () { /*
@font-face {
	font-family: ccc;
	src: url(https://cdn.bootcss.com/font-awesome/4.2.0/fonts/fontawesome-webfont.woff) format('woff');
	font-weight: normal;
	font-style: normal;
}

%s::before {
	font-family: ccc;
	content: "\f019";
	padding-right: .5em;
}

.jx_hide {
	display: none;
}
*/}), site.dl_icon));
			}

			site.styleBlock = styleBlock;
		}

		if (!eve) return ;
		H.info ('执行规则: %s<ID: %s>[事件: %s]', site.name || '<未知>', site.id || '未知', event);

		return eve.call (site);
	},

	/**
	 * get rule by ID
	 * @param  {String} id Rule id
	 * @return {Rule}      Rule Object
	 */
	get: function (id) {
		return sites.filter(function (site) { return site.id == id; }).pop();
	},
	
	exec: function (id, event) {
		return this.run(this.get(id), event);
	}
};

return function (event) {
	for (var i = sites.length; i--; ) {
		if (H.isFrame && sites[i].noFrame)
			continue;
		
		if (H.rule.check(sites[i], event) && H.rule.run(sites[i], event))
			return true;
	}
};
	})();

	try {
		GM_registerMenuCommand (H.sprintf('配置 %s[%s]', H.scriptName, H.version), function () {
			GM_openInTab('https://jixunmoe.github.io/cuwcl4c/config/', false);
		});

		H.log ('onStart 准备阶段 :: 开始');
		handleSite ('onStart');
		H.log ('onStart 准备阶段 :: 结束');

		document.addEventListener ('DOMContentLoaded', function () {
			H.log ('onBody 阶段 :: 开始');
			handleSite ('onBody');
			H.log ('onBody 阶段 :: 结束');
		}, false);

	} catch (e) {
		if (e.isExit) {
			H.log.apply ( 0, [].concat.apply ( ['脚本退出, 错误信息'], e.message ) );
		} else {
			H.error ('请务必将下述错误追踪代码提交至 %s\n\n%s', H.reportUrl, e.message);
		}
	}
}) ();