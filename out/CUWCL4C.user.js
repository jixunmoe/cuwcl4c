// ==UserScript==
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue

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

// 骑牛的会乱请求不存在的 jquery.map 文件，改用官网的
// @require        http://code.jquery.com/jquery-2.1.1.min.js

/// 骑牛 CDN
// @require        http://cdn.staticfile.org/crypto-js/3.1.2/components/core-min.js
// @require        http://cdn.staticfile.org/crypto-js/3.1.2/components/enc-base64-min.js

/// 兼容 GM 1.x, 2.x
// @require        https://greasyfork.org/scripts/2599/code/gm2_port_v104.js

// @author         jixun66
// @namespace      http://jixun.org/
// @version        3.0.280

// 全局匹配
// @include *
// @exclude http://pos.baidu.com/*
// ==/UserScript==


(function () {
	// 初始化
var createElement = document.createElement.bind (document);

var H = {
	scriptName: 'CUWCL4C',
	scriptHome: 'https://greasyfork.org/zh-CN/scripts/2600',
	reportUrl:  'https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600',

	version:    GM_info.script.version,
	currentUrl: location.href.split ('#')[0],
	lowerHost:  location.hostname.toLowerCase(),
	directHost: location.hostname.match(/\w+\.?\w+?$/)[0].toLowerCase(),

	defaultDlIcon: 'jx_dl',

	merge: function (parent) {
		if (arguments.length < 2)
			return parent || {};

		var args = arguments;
		for (var i = 1; i < arguments.length; i++) {
			Object.keys (arguments[i]).forEach (function (key) {
				parent[key] = args[i][key];
			});
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

	uri: function (url, filename, ref) {
		if (!H.config.bUseUri)
			return url;

		return 'cuwcl4c://|1|' +
			[url, filename.toString().replace(/['"\/\\:|]/g, '_'), (ref || location.href).toString().replace(/#.*/, '')].join('|');
	}
};

H.merge (H, {
	_log: console.log.bind (console),
	_inf: console.info.bind (console),
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
	}.bind (H, H.sprintf ('[%s][错误] ', H.scriptName))
});

H.config = H.merge ({
	bUseUri: false,
	bUseCustomRules: false,
	sCustomRule: ''
}, (function (conf) {
	if (!conf) return {};

	try {
		var _conf = JSON.parse (conf);

		for (var name in _conf) {
			if (_conf.hasOwnProperty (name)) {
				switch (name[0]) {
					case 'b':
						_conf[name] = _conf[name] == 'on';
						break;

					// s and default are not parsed.
				}
			}
		}

		return _conf;
	} catch (e) {
		H.info ('配置文件 [%s] 无效, 现在使用空白配置.', conf);
		return {};
	}
})(GM_getValue (H.scriptName)));

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

	waitUntil: function (ver4Check, func, replaceVar, timeInterval) {
		if ('string' == typeof ver4Check && ver4Check.indexOf ('.') !== -1) {
			ver4Check = ver4Check.split ('.');
		}
		if (ver4Check instanceof Array) {
			ver4Check = function (vars) {
				for (var i = 0, r = unsafeWindow; i < vars.length; i++) {
					r = r[vars[i]];
					if (!r)
						return ;
				}

				return true;
			}.bind (null, ver4Check.slice());
		};
		var timer = setInterval(function () {
			if (typeof (ver4Check) == 'function') {
				try {
					if (!ver4Check()) return;
				} catch (e) {
					// Not ready yet.
					return ;
				}
			} else if ('string' == typeof ver4Check) {
				if (typeof (unsafeWindow[ver4Check]) == 'undefined')
					return ;
			}
			clearInterval(timer);
			
			if (replaceVar && typeof (unsafeWindow[ver4Check]) == 'function') {
				var $obj = {};
				$obj[ver4Check] = replaceVar;
				unsafeOverwriteFunction ($obj);
				H.log('Function [ ' + ver4Check + ' ] Hooked.');
			}
			if (typeof (func) == 'function')
				func();
		}, 150);

		setTimeout (function () {
			// Timeout
			clearInterval(timer);
		}, timeInterval || 10000);
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
		var GET = H.parseQueryString(targetUrl),
			form = $('<form>')
				.attr('action', targetUrl.replace(/\?.*$/, ''))
				.text('正在跳转: ' + targetUrl).prependTo(document.body)
				.css ({fontSize: 12});

		if (Object.keys(GET).length == 0) {
			// POST when there's no param?
			// form.attr ('method', 'POST');
		} else {
			for (var g in GET)
				if (GET.hasOwnProperty(g))
					form.append($('<input>').attr({
						name: g,
						type: 'hidden'
					}).val(GET[g]));

		}

		form.submit();
		return 1;
	},

	// 网盘地址自动导向 [基于 phpDisk 的网盘]
	phpDiskAutoRedir: function (fCallback){
		if (!fCallback)
			fCallback = document.body ? H.reDirWithRef : function (p) { location.pathname = p };

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


	var sites = [ {
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
	}
}
,
{
	name: '通用 phpDisk 网盘规则',
	host: ['azpan.com', 'gxdisk.com', '2kuai.com', '1wp.me'],
	hide: [
		// azpan, gxdisk
		'.Downpagebox',

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
},
{
	name: '乐盘',
	host: ['lepan.cc', 'sx566.com'],
	hide: [
		'.ad', '[class^="banner"]', '#dl_tips',
		'.content_l > .down_list_1', '.file_tip',
		'.down_list_1 > .putong:first-child', '#code_box'
	],
	show: ['#down_box'],
	onBody: function () {
		H.phpDiskAutoRedir ();
		$('#header:first').next().remove ();
	}
},
{
	name: '威盘',
	host: ['vdisk.cn'],
	hide: ['#loadingbox', '#yanzhengbox', '#yzmbox', '#getbox > .btn:first-child'],
	show: ['#btnbox']
},
{
	name: '119g 网盘',
	host: ['d.119g.com'],
	noSubHost: true,

	onStart: function () {
		if (H.beginWith (location.pathname, '/f/') && !H.contains (location.pathname, '_bak')) {
			location.pathname = location.pathname.replace(/(_.+)?\./, '_bak.');
		}
	}
},
({

  /*
  	网易音乐下载解析 By Jixun
  	尝试使用 Coffee Script 写
   */
  name: '网易音乐下载解析',
  host: 'music.163.com',
  noSubHost: true,
  dl_icon: true,
  css: /* Resource: com.163.music.dl.css */
H.extract(function () { /*
.m-pbar, .m-pbar .barbg {
	width: 425px;
}

.m-playbar .play {
	width: 520px;
}

.m-playbar .oper {
	width: 110px;
}

.jx_dl {
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
*/}),
  onBody: function() {
    this.linkDownload = $('<a>').addClass(H.defaultDlIcon).appendTo($('.m-playbar .oper')).attr({
      title: '播放音乐, 即刻解析'
    }).click(function(e) {
      e.stopPropagation();
    });
    H.waitUntil('nm.m.f.xr.prototype.Al', (function() {
      unsafeExec(function(scriptName) {
        var _bakPlayerAl;
        _bakPlayerAl = nm.m.f.xr.prototype.Al;
        return nm.m.f.xr.prototype.Al = function(songObj) {
          var eveSongObj;
          eveSongObj = {
            artist: songObj.artists.map(function(artist) {
              return artist.name;
            }).join('、'),
            name: songObj.name,
            url: songObj.mp3Url
          };
          document.dispatchEvent(new CustomEvent(scriptName, {
            detail: eveSongObj
          }));
          _bakPlayerAl.apply(this, arguments);
        };
      }, H.scriptName);
      document.addEventListener(H.scriptName, (function(e) {
        var songObj;
        songObj = e.detail;
        this.linkDownload.attr({
          href: H.uri(songObj.url, H.sprintf('%s [%s].mp3', songObj.name, songObj.artist)),
          title: '下载: ' + songObj.name
        });
      }).bind(this));
    }).bind(this));
  }
}),
{
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
{
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
{
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
{
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
{
	name: '79 盘',
	host: '79pan.com',

	fullHost: 'www.79pan.com',
	onStart: function () {
		unsafeOverwriteFunctionSafeProxy ({
			open: tFunc
		});

		H.log ('隐藏、显示必要元素');
		H.forceShow.call(H.forceHide ('#code_box', '#down_box2'), '#down_box');

		H.log ('修正网站获取下载地址');
		if (this.fullHost != location.hostname)
			location.hostname = this.fullHost;
	},
	onBody: function () {
		H.waitUntil ('down_file_link', function () {
			// 强制显示地址
			unsafeWindow.down_file_link ();

			// 然后跳过去
			location.href = $('.down_btn').attr('href');
		});
	}
},
{
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
{
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
{
	name: '可乐盘',
	host: 'colafile.com',
	hide: [
		'.table_right', '#down_link3', '.tui', '.ad1 > .ad1 > *:not(.downbox)',

		// 计时下载页的广告
		'.hotrec-ele', '.viewshare-copy-outer'
	],
	onBody: function () {
		var file_id = location.pathname.match(/\d+/)[0];

		$.ajax({
			url: '/ajax.php?action=downaddress&file_id=' + file_id,
			headers: {
				'X-Forwarded-For': 'BAKA-' + Math.random()
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
{
	name: '城通网盘系列',
	host: ['400gb.com', 'ctdisk.com', 'pipipan.com', 'bego.cc'],
	hide: ['.captcha', '.kk_xshow', 'div.span6:first-child'],

	onBody: function () {
		// Fix Anti-ABP as it doesn't check the code.
		H.waitUntil ('guestviewchkform', null, function (that) {
			return that.randcode && that.randcode.value.length == 4;
		});
		
		document.user_form.hash_key.value = H.base64Decode(document.user_form.hash_info.value);
		$('.captcha_right').css('float', 'left');
		
		$('#vfcode:first').parent()
			.append(H.createNumPad(4, $('#randcode')[0], function () {
				document.user_form.submit();
				return true;
			}));

		H.log ('城通就绪.');
	}
},
{
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
{
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
{
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
{
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
{
	name: '邻居的耳朵',
	host: 'ear.duomi.com',
	noSubHost: true,
	onBody: function () {
		H.wordpressAudio ();
	}
},
{
	name: '好盘',
	host: 'howfile.com',
	
	hide: ['#floatdiv div', '.row1_right'],
	css : '#floatdiv { top: 150px; z-index: 99999; display: block !important; }'
},
{
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
{
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
{
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
{
	name: 'QQ 音乐下载解析',
	host: 'y.qq.com',
	noSubHost: true,

	css: /* Resource: com.qq.y.dl.css */
H.extract(function () { /*
.m_player .bar_op {
	left:  230px;
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
*/}),
	onBody: function () {
		H.waitUntil ('MUSIC.module.webPlayer.interFace.getSongUrl', function () {
			var dlBtn = $('<a>')
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
						mp3: 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3'.jstpl_format({
							stream: parseInt(songObj.mstream, 10) + 10,
							sid: parseInt(songObj.mid, 10) + 30000000
						}),
						name: songObj.msong
					} }) );

					return oldGetSong.apply (this, arguments);
				};
			}, H.scriptName);

			document.addEventListener (H.scriptName, function (e) {
				var songObj = e.detail;

				dlBtn.attr ({
					href: H.uri (songObj.mp3, songObj.name + '.mp3'),
					title: '下载: ' + songObj.name
				});
			}, false);
		});
	}
},
{
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
{
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
{
	name: '速度盘',
	host: ['sudupan.com'],
	show: ['#sdpxzlj', '#sdpxzlj > td'],
	onStart: function () {
		if (H.beginWith(location.pathname, '/down_')) {
			location.pathname = location.pathname.replace ('/down_', '/sdp/xiazai_');
		}
	}
},
{
	name: 'VV 网盘',
	host: 'vvpan.com',
	hide: ['#code_box', '.talk_show', '.banner_2', '.w_305', '.ad'],
	onStart: function () {
		H.phpDiskAutoRedir ();
	}
},
{
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
{
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
{
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
{
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
{
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
{
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
{
	name: '9盘',
	host: 'www.9pan.net',

	onStart: function () {
		if ( /\/\d/.test ( location.pathname ) ) {
			location.pathname = location.pathname.replace ('/', '/down-');
		}
	}
} ];

	if (H.config.bUseCustomRules) {
		try {
			[].splice.apply (sites, [0, 0].concat(eval (H.sprintf('[%s\n]', H.config.sCustomRule))));
		} catch (e) {
			H.info ('解析自定义规则时发生错误: %s', e.message);
		}
	}

	var handleSite = function (event) {
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
				site.dl_icon = H.defaultDlIcon;

			H.injectStyle.call (styleBlock, H.sprintf(/* Resource: AA.dl_btn.css */
H.extract(function () { /*
@font-face {
	font-family: ccc;
	-- Use 'build.font.sh' to build base64 string
	src: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxmb250IGhvcml6LWFkdi14PSIxNTM2Ij48Zm9udC1mYWNlIHVuaXRzLXBlci1lbT0iMTc5MiIgYXNjZW50PSIxNTM2IiBkZXNjZW50PSItMjU2Ii8+PG1pc3NpbmctZ2x5cGggaG9yaXotYWR2LXg9IjQ0OCIvPjxnbHlwaCB1bmljb2RlPSJBIiBob3Jpei1hZHYteD0iMTY2NCIgZD0iTTEyODAgMTkycTAgMjYgLTE5IDQ1dC00NSAxOXQtNDUgLTE5dC0xOSAtNDV0MTkgLTQ1dDQ1IC0xOXQ0NSAxOXQxOSA0NXpNMTUzNiAxOTJxMCAyNiAtMTkgNDV0LTQ1IDE5dC00NSAtMTl0LTE5IC00NXQxOSAtNDV0NDUgLTE5dDQ1IDE5dDE5IDQ1ek0xNjY0IDQxNnYtMzIwcTAgLTQwIC0yOCAtNjh0LTY4IC0yOGgtMTQ3MnEtNDAgMCAtNjggMjh0LTI4IDY4djMyMHEwIDQwIDI4IDY4dDY4IDI4aDQ2NWwxMzUgLTEzNiBxNTggLTU2IDEzNiAtNTZ0MTM2IDU2bDEzNiAxMzZoNDY0cTQwIDAgNjggLTI4dDI4IC02OHpNMTMzOSA5ODVxMTcgLTQxIC0xNCAtNzBsLTQ0OCAtNDQ4cS0xOCAtMTkgLTQ1IC0xOXQtNDUgMTlsLTQ0OCA0NDhxLTMxIDI5IC0xNCA3MHExNyAzOSA1OSAzOWgyNTZ2NDQ4cTAgMjYgMTkgNDV0NDUgMTloMjU2cTI2IDAgNDUgLTE5dDE5IC00NXYtNDQ4aDI1NnE0MiAwIDU5IC0zOXoiLz48L2ZvbnQ+PC9kZWZzPjwvc3ZnPg==) format('svg');
	font-weight: normal;
	font-style: normal;
}

.%s::before {
	font-family: ccc;
	content: "A";
	padding-right: .5em;
}
*/}), site.dl_icon));
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
	};

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