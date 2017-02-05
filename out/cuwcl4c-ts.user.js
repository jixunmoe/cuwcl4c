// ==UserScript==
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_getResourceText
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

// 避免 Source Map 文件找不到的错误
// @require        https://cdn.bootcss.com/jquery/2.1.4/jquery.js
// @require        https://cdn.bootcss.com/underscore.js/1.8.3/underscore.js

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
// @require        https://greasyfork.org/scripts/5672/code/Aria2-RPC-build-10.js

// VueJs, not always used.
// @resource       VueJs https://cdnjs.cloudflare.com/ajax/libs/vue/1.0.26/vue.min.js

// @author         Jixun.Moe<Yellow Yoshi>
// @namespace      http://jixun.org/
// @version        4.0.701

// 尝试使用脚本生成匹配规则
// ////               [Include Rules]

// @include http://localhost.cuwcl4c/*
// @include http://jixunmoe.github.io/*
// @include http://123564.com/*
// @include http://m.123564.com/*
// @include http://5xfile.com/*
// @include http://www.5xfile.com/*
// @include http://yun.baidu.com/*
// @include http://pan.baidu.com/*
// @include http://howfile.com/*
// @include http://*.howfile.com/*
// @include http://namipan.cc/*
// @include http://*.namipan.cc/*
// @include http://79pan.com/*
// @include http://*.79pan.com/*
// @include http://03xg.com/*
// @include http://*.03xg.com/*
// @include http://7mv.cc/*
// @include http://*.7mv.cc/*
// @include http://pan.52zz.org/*
// @include http://*.pan.52zz.org/*
// @include http://258pan.com/*
// @include http://*.258pan.com/*
// @include http://huimeiku.com/*
// @include http://*.huimeiku.com/*
// @include http://wpan.cc/*
// @include http://*.wpan.cc/*
// @include http://ypan.cc/*
// @include http://*.ypan.cc/*
// @include http://azpan.com/*
// @include http://*.azpan.com/*
// @include http://gxdisk.com/*
// @include http://*.gxdisk.com/*
// @include http://2kuai.com/*
// @include http://*.2kuai.com/*
// @include http://1wp.me/*
// @include http://*.1wp.me/*
// @include http://77pan.cc/*
// @include http://*.77pan.cc/*
// @include http://vvpan.com/*
// @include http://*.vvpan.com/*
// @include http://fmdisk.com/*
// @include http://*.fmdisk.com/*
// @include http://bx0635.com/*
// @include http://*.bx0635.com/*
// @include http://10pan.cc/*
// @include http://*.10pan.cc/*
// @include http://1pan.cc/*
// @include http://*.1pan.cc/*
// @include http://123wzwp.com/*
// @include http://*.123wzwp.com/*
// @include http://wwp5.com/*
// @include http://*.wwp5.com/*
// @include http://fydisk.com/*
// @include http://*.fydisk.com/*
// @include http://webhd.xuite.net/*
// @include http://sync.hamicloud.net/*
// @include http://www.yimuhe.com/*
// @include http://douban.fm/*
// @include https://douban.fm/*
// @include http://moe.fm/*
// @include http://music.163.com/*
// @include http://www.1ting.com/*
// @include http://www.23356.com/*
// @include http://www.app-echo.com/*
// @include http://web.kugou.com/*
// @include https://jixunmoe.github.io/cuwcl4c/config/

// GM_xmlHttpRequest 远端服务器列表
// @connect down.lepan.cc
// @connect music.baidu.com
// @connect yinyueyun.baidu.com
// @connect media.store.kugou.com
// @connect trackercdn.kugou.com
// @connect yinyuetai.com
// @connect itwusun.com
// @connect self

// 告诉 TamperMonkey 这个脚本不需要转换
// @nocompat Chrome

// ==/UserScript==
var define = (function () {
    var _modules = {};
    return define;
    function define(module, requires, callback) {
        var _this_module = {
            exports: {}
        };
        var params = requires.map((module) => {
            if (module == 'exports') {
                return _this_module.exports;
            }
            else if (module == 'require') {
                return require;
            }
            return require(module);
        });
        callback.apply(this, params);
        _modules[module] = _this_module.exports;
    }
    function require(module) {
        return _modules[module];
    }
})();
define("helper/Script", ["require", "exports"], function (require, exports) {
    "use strict";
    var Script;
    (function (Script) {
        Script.Name = "CUWCL4C";
        Script.Home = "https://greasyfork.org/zh-CN/scripts/2600";
        Script.Config = "https://jixunmoe.github.io/cuwcl4c/config/";
        Script.Feedback = "https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600";
        function ListenEvent(listener) {
            document.addEventListener(Script.Name, (e) => {
                var info;
                if (typeof e.detail == 'string') {
                    info = JSON.parse(e.detail);
                }
                else {
                    info = e.detail;
                }
                listener(info);
            });
        }
        Script.ListenEvent = ListenEvent;
        function FireEvent(name, data) {
            document.dispatchEvent(new CustomEvent(name, {
                detail: JSON.stringify(data)
            }));
        }
        Script.FireEvent = FireEvent;
        function RegisterStorageEvent(key, listener) {
            window.addEventListener('storage', (e) => {
                if (e.key == key) {
                    listener(key);
                }
            });
        }
        Script.RegisterStorageEvent = RegisterStorageEvent;
    })(Script = exports.Script || (exports.Script = {}));
});
define("helper/Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    // 常数
    exports.isFrame = _isFrame();
    exports.version = GM_info.script.version;
    exports.currentUrl = location.href.split('#')[0];
    exports.lowerHost = location.hostname.toLowerCase();
    exports.topHost = exports.lowerHost.match(/\w+\.?\w+?$/)[0];
    exports.topHostMask = `.${exports.topHost}`;
    exports.downloadIconClass = 'jx_dl';
    exports.downloadIconSelector = '.jx_dl';
    function _isFrame() {
        try {
            return unsafeWindow.top !== unsafeWindow.self;
        }
        catch (e) {
            return true;
        }
    }
});
define("helper/Logger", ["require", "exports", "helper/Script"], function (require, exports, Script_1) {
    "use strict";
    function DoLog(prefix, method, args) {
        if (args.length < 1)
            return;
        if (typeof args[0] == 'string') {
            args[0] = `[${Script_1.Script.Name}][${prefix}] ${args[0]}`;
        }
        else {
            args.splice(0, 0, `[${Script_1.Script.Name}][${prefix}] ${args[0]}`);
        }
        console[method].apply(console, args);
    }
    function WrapLog(prefix, method) {
        return (...args) => {
            return DoLog(prefix, method, args);
        };
    }
    function DoNothing() { }
    exports.log = DoNothing;
    exports.info = DoNothing;
    exports.error = DoNothing;
    exports.warn = DoNothing;
    function EnableLogs() {
        exports.log = WrapLog('日志', 'log');
        exports.info = WrapLog('信息', 'info');
        exports.error = WrapLog('错误', 'error');
        exports.warn = WrapLog('警告', 'warn');
    }
    exports.EnableLogs = EnableLogs;
});
define("helper/ScriptConfig", ["require", "exports", "helper/Script", "helper/Logger"], function (require, exports, Script_2, Logger_1) {
    "use strict";
    (function (UriType) {
        UriType[UriType["NormalUrl"] = 0] = "NormalUrl";
        /** @deprecated use others instead. */
        UriType[UriType["Custom"] = 1] = "Custom";
        UriType[UriType["Aria"] = 2] = "Aria";
    })(exports.UriType || (exports.UriType = {}));
    var UriType = exports.UriType;
    function ReadConfig() {
        try {
            return JSON.parse(GM_getValue(Script_2.Script.Name, ""));
        }
        catch (ex) {
            return { version: 0 };
        }
    }
    exports.Config = $.extend({
        version: 1,
        bDiaplayLog: true,
        bYellowEaseInternational: false,
        bYellowEaseUseOldApi: false,
        bYellowEaseUseThridOnFail: false,
        bUseCustomRules: false,
        dAria_auth: Aria2.AUTH.noAuth,
        dAria_port: 6800,
        dUriType: UriType.NormalUrl,
        sAria_dir: "D:\\Download\\",
        sAria_host: "127.0.0.1",
        sAria_pass: "",
        sAria_user: "",
        sCustomRule: ""
    }, ReadConfig());
    // 升级
    const __latest_version = 1;
    if (exports.Config.version != __latest_version) {
        switch (exports.Config.version) {
            case undefined:
            case 0:
                Logger_1.info('升级 v0 配置文件...');
                exports.Config.version = 1;
                exports.Config.bYellowEaseInternational = exports.Config.bInternational;
                exports.Config.bYellowEaseUseOldApi = exports.Config.bProxyInstalled;
                exports.Config.bYellowEaseUseThridOnFail = exports.Config.bUseThridOnFail;
                delete exports.Config.bInternational;
                delete exports.Config.bUseThridOnFail;
                delete exports.Config.bProxyInstalled;
                break;
            case 1:
                break;
        }
        GM_setValue(Script_2.Script.Name, JSON.stringify(exports.Config));
    }
    if (exports.Config.bDiaplayLog)
        Logger_1.EnableLogs();
});
define("helper/Extension", ["require", "exports"], function (require, exports) {
    "use strict";
    function BeginWith(str, what) {
        return str.indexOf(what) === 0;
    }
    exports.BeginWith = BeginWith;
    function EndWith(str, what) {
        return str.slice(-what.length) == what;
    }
    exports.EndWith = EndWith;
    function Contains(str, what) {
        return str.indexOf(what) != -1;
    }
    exports.Contains = Contains;
    function GetFirstKey(obj) {
        return Object.keys(obj)[0];
    }
    exports.GetFirstKey = GetFirstKey;
    function GetFirstValue(obj) {
        try {
            return obj[GetFirstKey(obj)];
        }
        catch (ex) {
            return null;
        }
    }
    exports.GetFirstValue = GetFirstValue;
    /**
     * 从链接获取文件后缀名。
     * 包括 `.` 字符，如 `.ts`
     */
    function GetExtensionFromUrl(url) {
        var m = url.match(/.+\/(?:[^.]+(\..+?))(?:\?|$)/);
        return m ? m[1] : null;
    }
    exports.GetExtensionFromUrl = GetExtensionFromUrl;
    // Fisher-Yates Shuffle by community wiki(?)
    // http://stackoverflow.com/a/6274398
    function Shuffle(array) {
        var counter = array.length;
        var temp, index;
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);
            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }
    exports.Shuffle = Shuffle;
});
/// <reference path="../typings/globals/jquery/index.d.ts" />
define("helper/QueryString", ["require", "exports", "helper/Extension"], function (require, exports, Extension_1) {
    "use strict";
    function GetFlashVars(el) {
        if (!el)
            return {};
        var ele = ('jquery' in el ? el[0] : el);
        if (ele.getAttribute('type') != 'flash')
            return {};
        var flashVars = {};
        var size = ele.childNodes.length;
        var flashObject;
        for (let i = size; i--;) {
            if (ele.childNodes[i].name == 'flashvars') {
                flashObject = ele.childNodes[i];
                flashObject.value.replace(/&amp;/g, '&')
                    .replace(/([\s\S]+?)=([\s\S]+?)(&|$)/g, (n, key, value) => {
                    // 利用正则的批量替换功能抓取数据
                    flashVars[key] = decodeURIComponent(value);
                    return '';
                });
                return flashVars;
            }
        }
        return {};
    }
    exports.GetFlashVars = GetFlashVars;
    function Parse(query) {
        var urlParams;
        if (Extension_1.Contains(query, '?')) {
            urlParams = query.slice(query.indexOf('?') + 1).split('&');
        }
        else {
            urlParams = query.split('&');
        }
        var ret = {};
        var queryStr;
        var posEqual;
        for (var i = urlParams.length; i--;) {
            queryStr = urlParams[i].toString();
            posEqual = queryStr.indexOf('=');
            if (posEqual == -1)
                continue;
            ret[decodeURIComponent(queryStr.slice(0, posEqual))] =
                decodeURIComponent(queryStr.slice(posEqual + 1));
        }
        return ret;
    }
    exports.Parse = Parse;
});
define("helper/StyleSheet", ["require", "exports"], function (require, exports) {
    "use strict";
    class StyleSheet {
        constructor() {
            this.style = document.createElement('style');
            this.Apply();
        }
        Add(...styleText) {
            this.style.textContent += '\n' + styleText.join('\n');
        }
        Hide(selector, ...selectors) {
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = `${selectors.join(', ')} { display: none !important }`;
            this.Add(styleText);
        }
        Show(selector, ...selectors) {
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = `${selectors.join(', ')} { display: block !important }`;
            this.Add(styleText);
        }
        HideFrames() {
            this.Hide('frame, iframe, frameset');
        }
        Apply(body = true) {
            if (body && document.body) {
                document.body.appendChild(this.style);
            }
            else {
                document.head.appendChild(this.style);
            }
        }
    }
    exports.StyleSheet = StyleSheet;
});
define("helper/Downloader", ["require", "exports", "helper/Script", "helper/ScriptConfig", "helper/Extension"], function (require, exports, Script_3, ScriptConfig_1, Extension_2) {
    "use strict";
    /// <reference path="../typings/Userscript.d.ts" />
    /// <reference path="../typings/GM_Aria2RPC.d.ts" />
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var config = ScriptConfig_1.Config;
    class Downloader {
        constructor() {
            this._captured = false;
            // TODO: ??
        }
        GenerateUrlPart(url, filename, ref) {
            return `${url}|${this.GetReferrerUrl(filename)}|${this.GetReferrerUrl(ref)}`;
        }
        GetReferrerUrl(url) {
            return String(url || location.href).replace(/#.*/, '');
        }
        NormaliseFilename(filename) {
            return String(filename).replace(/['"\/\\:|]/g, '_');
        }
        GenerateUri(url, filename, ref) {
            switch (config.dUriType) {
                case ScriptConfig_1.UriType.Custom:
                    return `cuwcl4c://|1|${this.GenerateUrlPart(url, filename, ref)}`;
                case ScriptConfig_1.UriType.Aria:
                    if (!this._captured)
                        this.CaptureAria();
                    return `aria2://|${this.GenerateUrlPart(url, filename, ref)}`;
            }
            return url;
        }
        CaptureAria(el) {
            this._captured = true;
            this.SetupAria(false);
            if (!el)
                el = document.body;
            $(el).click((e) => {
                var el = e.target;
                var $el = $(el);
                var linkEl = ($el.is('a') ? el : $el.parents('a')[0]);
                if (linkEl && linkEl.tagName == 'A' && Extension_2.BeginWith(linkEl.href, 'aria2://|')) {
                    e.stopPropagation();
                    e.preventDefault();
                    var link = linkEl.href.split('|');
                    this.AddToAria(link[1], decodeURIComponent(link[2]), link[3], linkEl.classList.contains('aria-cookie'));
                }
            });
        }
        AddToAria(url, filename, referer, cookie, headers) {
            var ariaParam = {
                out: filename,
                referer: referer || location.href,
                dir: config.sAria_dir,
                'user-agent': navigator.userAgent,
                header: headers || []
            };
            if (cookie === true)
                cookie = document.cookie;
            if (cookie)
                ariaParam.header.push('Cookie: ' + cookie);
            this.aria.addUri([url], ariaParam, (r) => { }, (b, r) => {
                var sErrorMsg;
                if (r.error) {
                    sErrorMsg = `错误代码 ${r.error.code}: ${r.error.message}`;
                }
                else {
                    sErrorMsg = "与 Aria2 后台通信失败, 服务未开启?";
                }
                alert(`[${Script_3.Script.Name}] 提交任务发生错误!

${sErrorMsg}`);
            });
        }
        SetupAria(forceSetup) {
            if (forceSetup || !this.aria) {
                this.aria = new Aria2({
                    auth: {
                        type: config.dAria_auth,
                        user: config.sAria_user,
                        pass: config.sAria_pass
                    },
                    host: config.sAria_host,
                    port: config.dAria_port
                });
            }
        }
        AddDownload(url, file) {
            if (config.dUriType == ScriptConfig_1.UriType.Aria) {
                this.AddToAria(url, file);
            }
            else {
                GM_openInTab(this.GenerateUri(url, file), true);
            }
        }
    }
    exports.Downloader = Downloader;
});
define("SiteRule", ["require", "exports", "helper/Constants", "helper/Extension", "helper/StyleSheet", "helper/Logger"], function (require, exports, Constants_1, Extension_3, StyleSheet_1, Logger_2) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    exports.Sites = [];
    function Add(siteRule) {
        siteRule._styleApplied = false;
        exports.Sites.push(siteRule);
    }
    exports.Add = Add;
    function CheckPath(path, rule) {
        if ($.isArray(rule)) {
            for (var i = rule.length; i--;) {
                if (CheckPath(path, rule[i])) {
                    return true;
                }
            }
            return false;
        }
        if ($.isFunction(rule)) {
            return rule(path);
        }
        if (typeof rule === 'string') {
            return Extension_3.BeginWith(path, rule);
        }
        if (rule instanceof RegExp) {
            return rule.test(path);
        }
        return false;
    }
    exports.CheckPath = CheckPath;
    function Check(site, event) {
        if (site.subModule) {
            return false;
        }
        if (typeof site.host == 'string') {
            site.host = [site.host];
        }
        var hosts = site.host.map((host) => {
            return host.toLowerCase();
        });
        if (!Extension_3.Contains(hosts, Constants_1.lowerHost)) {
            if (site.noSubHost)
                return false;
            var matched = false;
            for (var i = hosts.length; i--;) {
                if (Extension_3.EndWith(hosts[i], Constants_1.topHostMask)) {
                    matched = true;
                    break;
                }
            }
            if (!matched)
                return false;
        }
        if (site.path) {
            return CheckPath(location.pathname, site.path);
        }
        return true;
    }
    exports.Check = Check;
    function Get(id) {
        for (var i = exports.Sites.length; i--;) {
            if (exports.Sites[i].id == id) {
                return exports.Sites[i];
            }
        }
        return null;
    }
    exports.Get = Get;
    function Execute(id, event) {
        switch (event.toLowerCase()) {
            case 'start':
                Get(id).onStart();
                break;
            case 'body':
                Get(id).onBody();
                break;
        }
    }
    exports.Execute = Execute;
    function FireEvent(event) {
        for (var i = exports.Sites.length; i--;) {
            var rule = exports.Sites[i];
            if (Constants_1.isFrame && !rule.runInFrame)
                continue;
            if (Check(rule, event)) {
                Run(rule, event);
            }
        }
    }
    exports.FireEvent = FireEvent;
    function Run(site, eventName) {
        var event;
        switch (eventName.toLowerCase()) {
            case 'start':
                event = site.onStart;
                break;
            case 'body':
                event = site.onBody;
                break;
            default:
                Logger_2.error(`无效的事件 ${eventName}`);
                return;
        }
        if (!site._styleApplied) {
            site._styleApplied = true;
            site.style = new StyleSheet_1.StyleSheet();
            if (site.hide) {
                site.style.Hide(site.hide);
            }
            if (site.show) {
                site.style.Show(site.show);
            }
            if (site.css) {
                site.style.Add(site.css);
            }
            if (site.dl_icon) {
                site.style.Add(`
            
@font-face {
	font-family: ccc;
	src: url(https://cdn.bootcss.com/font-awesome/4.2.0/fonts/fontawesome-webfont.woff) format('woff');
	font-weight: normal;
	font-style: normal;
}

${Constants_1.downloadIconSelector}::before {
	font-family: ccc;
	content: "\\f019";
	padding-right: .5em;
}

.jx_hide {
	display: none;
}

            `);
            }
        }
        site.style.Apply(true);
        if (!event)
            return;
        Logger_2.info(`执行规则: ${site.id} 于 ${site.name} [事件: ${eventName}]`);
        event.call(this);
    }
    exports.Run = Run;
});
define("site/AA.Config", ["require", "exports", "helper/Constants", "helper/ScriptConfig", "helper/Script", "helper/Downloader"], function (require, exports, Constants_2, ScriptConfig_2, Script_4, Downloader_1) {
    "use strict";
    var rule = {
        bd: null,
        id: 'internal.config',
        name: '脚本配置页面',
        subModule: false,
        includeSubHost: false,
        host: ['localhost.cuwcl4c', 'jixunmoe.github.io'],
        path: ['/config/', '/cuwcl4c/config'],
        onStart: () => {
            unsafeWindow.rScriptVersion = Constants_2.version;
            unsafeWindow.rScriptConfig = JSON.stringify(ScriptConfig_2.Config);
            var _c = confirm;
            document.addEventListener('SaveConfig', function (e) {
                try {
                    var config = JSON.stringify(JSON.parse(e.detail));
                }
                catch (e) {
                    alert('解析设定值出错!');
                    return;
                }
                if (_c(`确定储存设定至 ${Script_4.Script.Name}?`))
                    GM_setValue(Script_4.Script.Name, config);
            });
        },
        onBody: () => {
            rule.bd = new Downloader_1.Downloader();
            rule.bd.CaptureAria();
        }
    };
    exports.Rules = [rule];
});
define("helper/Wait", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    function WaitUntil(check, cb, nTimeout = 10000, nInterval = 150) {
        if ('string' == typeof check) {
            check = check.split('.');
        }
        var isReady;
        if ($.isArray(check)) {
            isReady = () => {
                var r = unsafeWindow;
                for (var i = 0; i < check.length; i++) {
                    r = r[check[i]];
                    if (!r)
                        return false;
                }
                return true;
            };
        }
        else {
            isReady = () => {
                try {
                    return check();
                }
                catch (error) {
                    return false;
                }
            };
        }
        var timer = setInterval(() => {
            if (!isReady()) {
                return;
            }
            clearInterval(timer);
            cb.call(this);
        }, nInterval);
        if (nTimeout !== true) {
            setTimeout(() => {
                clearInterval(timer);
            }, nTimeout);
        }
    }
    exports.WaitUntil = WaitUntil;
});
define("helper/Redirect", ["require", "exports", "helper/Wait", "helper/Extension", "helper/Logger"], function (require, exports, Wait_1, Extension_4, Logger_3) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    /**
     * 跳转后保留当前页面作为 referrer.
     */
    function RedirectTo(url) {
        Logger_3.info(`准备跳转 ${url}...`);
        var link = $('<a>')
            .attr('href', url)
            .text(`正在跳转 [${url}], 请稍后.. `)
            .prependTo(document.body)
            .css({ fontSize: 12, color: 'inherit' });
        link[0].click();
    }
    exports.RedirectTo = RedirectTo;
    /**
     * phpDisk 通用跳转文件下载页面函数
     *
     * 返回 true 代表成功
     * 否则代表找不到规则。
     */
    function phpdiskAutoRedirect(callback) {
        if (!callback) {
            callback = document.body ? RedirectTo : (url) => {
                Wait_1.WaitUntil('document.body', () => {
                    RedirectTo(url);
                });
            };
        }
        var rCheckPath = /\/(file)?(file|view)([\/.\-_].*)/;
        if (rCheckPath.test(location.pathname)) {
            callback(location.pathname.replace(rCheckPath, '/$1down$3'));
        }
        else if (Extension_4.BeginWith(location.pathname, '/viewfile')) {
            callback(location.pathname.replace('/viewfile', '/download'));
        }
        else {
            return false;
        }
        return true;
    }
    exports.phpdiskAutoRedirect = phpdiskAutoRedirect;
});
define("site/dl.123564", ["require", "exports", "helper/Extension", "helper/Redirect"], function (require, exports, Extension_5, Redirect_1) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var rule = {
        id: 'dl.123564',
        name: '123564 网盘',
        host: ['123564.com', 'm.123564.com'],
        includeSubHost: false,
        subModule: false,
        hide: '#yzm',
        show: '#download',
        css: `
.ad1, .ad4{
    height: 999px !important;
    width:  0px   !important;
}
    `,
        onStart: () => {
            unsafeWindow.killpanads = 1;
        },
        onBody: () => {
            // 文件第一页
            var url = $('.caocuo .jubao').next().find('a').attr('href');
            if (url) {
                Redirect_1.RedirectTo(url);
            }
            else if (Extension_5.Contains(location.pathname, '/downpanel.asp')) {
                // 第三页 - 最终下载地址展示
                url = $("div > a[href*='/down.asp']").attr('href');
                Redirect_1.RedirectTo(url);
            }
            else {
                // 第二页: 填写验证码
                $('#download > a').click();
            }
        }
    };
    exports.Rules = [rule];
});
define("site/dl.5xfile", ["require", "exports"], function (require, exports) {
    "use strict";
    var rule = {
        id: 'dl.5xfile',
        name: '五星网盘',
        host: ['5xfile.com', 'www.5xfile.com'],
        includeSubHost: false,
        subModule: false,
        onStart: () => {
            // TODO: 启动事件
        },
        onBody: () => {
            // TODO: 页面事件
        }
    };
    exports.Rules = [rule];
});
define("site/dl.baidu", ["require", "exports", "helper/Wait"], function (require, exports, Wait_2) {
    "use strict";
    var rule = {
        id: 'dl.baidu',
        name: '百度盘免下载管家',
        host: ['yun.baidu.com', 'pan.baidu.com'],
        includeSubHost: false,
        subModule: false,
        onStart: () => {
        },
        onBody: () => {
            Wait_2.WaitUntil('require', function () {
                unsafeExec(function () {
                    var require = window.require;
                    var service = require('disk-system:widget/plugin/download/util/downloadCommonUtil.js');
                    service.isPlatformWindows = function () { return false; };
                });
            });
        }
    };
    exports.Rules = [rule];
});
define("site/dl.howfile", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var rule = {
        id: 'dl.howfile',
        name: '好盘 [howfile.com]',
        host: 'howfile.com',
        includeSubHost: true,
        subModule: false,
        css: `
#floatdiv {
    top: 150px;
    z-index: 99999;
    display: block !important;
}
    `,
        onStart: () => {
        },
        onBody: () => {
        }
    };
    exports.Rules = [rule];
});
define("site/dl.namipan.cc", ["require", "exports"], function (require, exports) {
    "use strict";
    var rule = {
        id: 'dl.namipan',
        name: '纳米盘.cc [原 87盘 应该]',
        host: 'namipan.cc',
        path: ['/file/', '/down.php'],
        includeSubHost: true,
        subModule: false,
        hide: '#box',
        css: `
body, body > .ggao {
    height: initial;
}
    `,
        onStart: () => {
        },
        onBody: () => {
            // 下载按钮: #downgo
            var m = location.pathname.match(/\d+/);
            var dlBtn = $('#downgo');
            if (dlBtn.length > 0 && m) {
                var frame = $('<iframe>');
                var note = $('<p>');
                note.text('注意: 需要登录才能下载。').css('color', 'red');
                frame.attr({
                    src: `/down.php?file_id=${m[0]}`,
                }).css({
                    display: 'table',
                    border: 0,
                    borderBottom: '1px solid #ccc',
                    width: '100%',
                    height: 70
                });
                dlBtn.before(frame);
                frame.after(note);
            }
        }
    };
    exports.Rules = [rule];
});
define("site/dl.phpdisk", ["require", "exports", "helper/Wait", "helper/Redirect", "helper/Script"], function (require, exports, Wait_3, Redirect_2, Script_5) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var phpdiskA = {
        id: 'phpdisk.a',
        name: 'PHPDisk A 类网赚网盘',
        host: [
            '79pan.com', '03xg.com',
            '7mv.cc', 'pan.52zz.org',
            '258pan.com', 'huimeiku.com'
        ],
        hide: '#code_box, #down_box2, #codefrm, .ad, [class^="banner"]',
        show: '#down_box',
        includeSubHost: true,
        subModule: false,
        onStart: () => {
            unsafeOverwriteFunctionSafeProxy({
                open: url => null
            });
        },
        onBody: () => {
            var self = this;
            Wait_3.WaitUntil('down_file_link', () => {
                var ctx = unsafeWindow;
                // 避免地址被覆盖
                ctx.update_sec = null;
                // 强制显示地址
                ctx.down_file_link();
                // 强制显示下载地址
                if (ctx.show_down_url)
                    ctx.show_down_url('down_a1');
                var jumpUrl = $('#down_link').find('a').attr('href');
                // 然后跳过去
                if (jumpUrl) {
                    Redirect_2.RedirectTo(jumpUrl);
                }
                else {
                    alert(`[${Script_5.Script.Name}]: 应用 ${self.name} 失败:\n找不到跳转地址.`);
                }
            });
        }
    };
    var phpdiskZ = {
        id: 'phpdisk.z',
        name: '通用 phpDisk.z 网盘规则',
        // 规则: 直接跳转 /file-xxx -> /down-xxx
        //       并隐藏 down_box2, 显示 down_box
        host: [
            'wpan.cc', 'ypan.cc',
            'azpan.com', 'gxdisk.com', '2kuai.com', '1wp.me',
            '77pan.cc', 'vvpan.com', 'fmdisk.com', 'bx0635.com',
            '10pan.cc', '1pan.cc', '123wzwp.com', 'wwp5.com',
            'fydisk.com'
        ],
        hide: `.Downpagebox, .talk_show, .banner_2, .w_305, .ad,
           #vcode, #tui, .dcode, #down_box2, #dl_tips, .nal,
           .scbar_hot_td, #incode`,
        show: '#down_box, #dl_addr',
        includeSubHost: true,
        subModule: false,
        onStart: () => {
            unsafeOverwriteFunctionSafeProxy({
                down_process: unknown => null
            });
            Redirect_2.phpdiskAutoRedirect(null);
        },
        onBody: () => {
        }
    };
    exports.Rules = [phpdiskA, phpdiskZ];
});
define("site/dl.xuite", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var rule = {
        id: 'dl.hami-cloud',
        name: 'Hami+ 個人雲',
        host: ['webhd.xuite.net', 'sync.hamicloud.net'],
        path: '/_oops/',
        includeSubHost: false,
        subModule: false,
        onStart: () => {
        },
        onBody: () => {
            $('#share-download-func-submit').click();
            unsafeExec(function () {
                $(function () {
                    $('#global').data('time', 9);
                });
            });
        }
    };
    exports.Rules = [rule];
});
define("site/dl.yimuhe", ["require", "exports", "helper/Extension", "helper/Redirect"], function (require, exports, Extension_6, Redirect_3) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    var rule = {
        id: 'dl.yimuhe',
        name: '一木禾',
        host: 'www.yimuhe.com',
        hide: '#loading, .ggao, .kuan',
        show: '#yzm',
        includeSubHost: false,
        subModule: false,
        onStart: () => {
            Redirect_3.phpdiskAutoRedirect(null);
        },
        onBody: () => {
            if (Extension_6.BeginWith(location.pathname, '/n_dd.php')) {
                Redirect_3.RedirectTo($('#downs').attr('href'));
                return;
            }
            var dlContainer = document.getElementById('download');
            if (!dlContainer)
                return;
            // 当下载框的 style 属性被更改后, 模拟下载按钮单击.
            var mo = new MutationObserver(function () {
                $('a', dlContainer)[1].click();
            });
            mo.observe(dlContainer, { attributes: true });
        }
    };
    exports.Rules = [rule];
});
define("site/fm.douban", ["require", "exports", "helper/Logger", "helper/Wait", "helper/Downloader"], function (require, exports, Logger_4, Wait_4, Downloader_2) {
    "use strict";
    var rule = {
        id: 'fm.douban',
        ssl: true,
        name: '豆瓣电台下载解析',
        host: 'douban.fm',
        includeSubHost: false,
        subModule: false,
        css: `
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
    `,
        bd: null,
        onStart: () => {
            rule.bd = new Downloader_2.Downloader();
            rule.bd.CaptureAria();
        },
        onBody: () => {
            var linkDownload = $('<a>');
            linkDownload.css('transition', 'all .2s')
                .attr('target', '_blank')
                .attr('id', 'jx_douban_dl')
                .text('下载');
            $('<div>')
                .attr('id', 'jx_douban_dl_wrap')
                .append(linkDownload)
                .insertAfter('.player-wrap');
            Logger_4.info('等待豆瓣电台加载 ..');
            Wait_4.WaitUntil('extStatusHandler', function () {
                Logger_4.info('绑定豆瓣电台函数 ..');
                unsafeOverwriteFunctionSafeProxy({
                    extStatusHandler: function (jsonSongObj) {
                        var event = JSON.parse(jsonSongObj);
                        if ('start' == event.type) {
                            var song = event.song;
                            var file = song.title + song.url.slice(-4);
                            linkDownload
                                .attr('href', rule.bd.GenerateUri(song.url, file))
                                .attr('title', `下载: ${song.title}`);
                            Logger_4.info(`${song.title} => ${song.url}`);
                        }
                        throw new ErrorUnsafeSuccess();
                    }
                });
                Logger_4.info('函数绑定完毕, Enjoy~');
            });
        }
    };
    exports.Rules = [rule];
});
define("site/fm.moe", ["require", "exports", "helper/Downloader", "helper/Script"], function (require, exports, Downloader_3, Script_6) {
    "use strict";
    var rule = {
        id: 'fm.moe',
        ssl: false,
        name: '萌否电台',
        host: 'moe.fm',
        includeSubHost: false,
        subModule: false,
        css: `

a.jixun-dl {
    width: 26px !important;
    background-position: -19px -96px !important;
    transform: rotate(90deg);
}

    `,
        bd: null,
        onStart: () => {
            rule.bd = new Downloader_3.Downloader();
            rule.bd.CaptureAria();
        },
        onBody: () => {
            unsafeWindow.is_login = true;
            var dlLink = $('<a>');
            dlLink
                .addClass('player-button left jixun-dl')
                .insertAfter('div.player-button.button-volume');
            Script_6.Script.ListenEvent((clip) => {
                dlLink
                    .attr('href', rule.bd.GenerateUri(clip.url, `${clip.sub_title}.mp3`))
                    .attr('title', `下载: ${clip.sub_title}`);
            });
            unsafeExec((scriptName) => {
                function notifyUpdate(clip) {
                    document.dispatchEvent(new CustomEvent(scriptName, { detail: JSON.stringify(clip) }));
                }
                define('plugin/jixun', function (require, exports) {
                    console.info('[CUWCL4C] 开始注入 ...');
                    var listen = require('/public/js/fm/page/listen.js');
                    var player = require('player/player');
                    var _initPlayer = player.initPlayer;
                    player.initPlayer = function (clip) {
                        notifyUpdate(clip);
                        _initPlayer.apply(this, arguments);
                    };
                    console.info('[CUWCL4C] 注入结束 ...');
                });
                // 要求载入外挂模组
                seajs.use('plugin/jixun');
            }, Script_6.Script.Name);
        }
    };
    exports.Rules = [rule];
});
define("site/music.163", ["require", "exports", "helper/Logger", "helper/Constants", "helper/Wait", "helper/Downloader", "helper/Script", "helper/ScriptConfig", "helper/QueryString", "helper/Extension"], function (require, exports, Logger_5, Constants_3, Wait_5, Downloader_4, Script_7, ScriptConfig_3, qs, Extension_7) {
    "use strict";
    const __MP3_BLANK = 'https://jixunmoe.github.io/cuwcl4c/blank.mp3';
    var rule = {
        id: 'music.163',
        ssl: false,
        name: '黄易云音乐',
        host: 'music.163.com',
        includeSubHost: false,
        subModule: false,
        runInFrame: true,
        dl_icon: true,
        css: `

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

/* 底部单曲下载 */
.m-playbar .oper .jx_btn {
    text-indent: 0;
    font-size: 1.5em;
    margin: 13px 2px 0 0;
    float: left;
    color: #ccc;
    text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em #aaa;
    line-height: 1.6em;
    font-size: 1.2em;
}

.m-playbar .oper .jx_dl::before {
    padding-right: .25em;
}

.jx_btn:hover {
    color: white;
}

/* 播放列表下载 */
.m-playbar .listhdc .jx_dl.addall {
    left: 306px;
    line-height: 1em;
    /* 多一个 px, 对齐文字 */
    top: 13px;
}

.m-playbar .listhdc .line.jx_dl_line {
    left: 385px;
}

    `,
        instance: null,
        onStart: () => {
            rule.instance = new YellowEase();
        },
        onBody: () => {
            rule.instance.BodyEvent();
        }
    };
    exports.Rules = [rule];
    class YellowEase {
        constructor() {
            this._reloadCache = true;
            if (localStorage.__HIDE_BANNER) {
                rule.style.Hide('#index-banner');
            }
            if (ScriptConfig_3.Config.bYellowEaseInternational)
                this._cdns = GenerateCdnList();
            this._downloader = new Downloader_4.Downloader();
            unsafeExec(() => {
                var fakePlatForm = navigator.platform + "--Fake-mac";
                Object.defineProperty(navigator, "platform", {
                    get: () => { return fakePlatForm; },
                    set: () => { }
                });
            });
        }
        BodyEvent() {
            Wait_5.WaitUntil('nm.x', () => {
                // 两个版权提示, 一个权限提示.
                var fnBypassCr1 = this.Search(unsafeWindow.nej.e, 'nej.e', '.dataset;if');
                var fnBypassCr2 = this.Search(unsafeWindow.nm.x, 'nm.x', '.copyrightId==');
                var fnBypassCr3 = this.Search(unsafeWindow.nm.x, 'nm.x', '.privilege;if');
                unsafeExec((fnBypassCr1, fnBypassCr2, fnBypassCr3) => {
                    var _fnBypassCr1 = window.nej.e[fnBypassCr1];
                    window.nej.e[fnBypassCr1] = function (z, name) {
                        if (name == 'copyright' || name == 'resCopyright') {
                            return 1;
                        }
                        return _fnBypassCr1.apply(this, arguments);
                    };
                    window.nm.x[fnBypassCr2] = () => {
                        return false;
                    };
                    window.nm.x[fnBypassCr3] = (song) => {
                        song.status = 0;
                        if (song.privilege) {
                            song.privilege.pl = 320000;
                        }
                        return 0;
                    };
                }, fnBypassCr1, fnBypassCr2, fnBypassCr3);
            });
            if (Constants_3.isFrame) {
                this.FramePage();
            }
            else {
                this.PlayerPage();
            }
        }
        Search(base, displayBase, keyword, suppressLog = false) {
            for (let itemName in base) {
                if (base.hasOwnProperty(itemName)) {
                    let fn = base[itemName];
                    if (fn && typeof fn == 'function') {
                        let fnStr = String(fn);
                        if (TestString(fnStr, keyword)) {
                            if (!suppressLog)
                                Logger_5.info(`定位查找 %c${keyword}%c 成功: %c${displayBase}.${itemName}`, 'color: darkviolet', 'reset', 'color: green');
                            return itemName;
                        }
                    }
                }
            }
            if (!suppressLog)
                Logger_5.error(`定位查找子函数 ${keyword} 于 ${displayBase} 失败, 请联系作者修复!`);
            return null;
        }
        SearchSubPrototype(base, displayBase, keyword, suppressLog = false) {
            for (let itemName in base) {
                if (base.hasOwnProperty(itemName)) {
                    let newBase = base[itemName];
                    // 检查现在的这个是不是子类
                    if (newBase && newBase.prototype) {
                        // info(`查找 %c${displayBase}.${itemName}.prototype%c ...`, 'color:lightgray', 'reset');
                        let r = this.Search(newBase.prototype, displayBase, keyword, true);
                        if (r != null) {
                            if (!suppressLog)
                                Logger_5.info(`定位查找 %c${keyword}%c 成功: %c${displayBase}.${itemName}::${r}`, 'color: darkviolet', 'reset', 'color: green');
                            return [itemName, 'prototype', r];
                        }
                    }
                }
            }
            if (!suppressLog)
                Logger_5.error(`定位查找子类函数 ${keyword} 于 ${displayBase} 失败, 请联系作者修复!`);
            return null;
        }
        PlayerPage() {
            this._btnDownload = $('<a>');
            this._btnDownload
                .attr('title', '播放音乐，即刻解析。')
                .click((e) => e.stopPropagation())
                .addClass(Constants_3.downloadIconClass)
                .addClass('jx_btn')
                .appendTo('.m-playbar .oper');
            // TODO: 加入歌单下载按钮
            this._btnDownloadAll = $('<a>');
            this._btnDownloadAll
                .addClass('addall')
                .text('全部下载')
                .addClass(Constants_3.downloadIconClass)
                .click(() => this.DownloadAll());
            if (ScriptConfig_3.Config.dUriType == ScriptConfig_3.UriType.Aria) {
                this._downloader.CaptureAria(this._btnDownload);
            }
            else {
            }
            if (location.pathname == '/demo/fm') {
                this.HookRadioPlayer();
            }
            else {
                this.HookNormalPlayer();
            }
        }
        DownloadAll() {
            // TODO: 下载所有曲目
        }
        HookNormalPlayer() {
            Wait_5.WaitUntil(() => {
                return document.querySelector('.listhdc > .addall') != null;
            }, () => {
                var dlLine = $('<a>');
                dlLine
                    .addClass('line jx_dl_line')
                    .hide();
                this._btnDownloadAll
                    .insertBefore('.m-playbar .listhdc .addall')
                    .after(dlLine)
                    .hide();
            }, true, 500);
            function nextSong() {
                document.querySelector('.nxt').click();
            }
            Wait_5.WaitUntil('nej.j', () => {
                var fnAjax = this.Search(unsafeWindow.nej.j, "nej.j", '.replace("api","weapi');
                var fnGetSongRaw = this.SearchSubPrototype(unsafeWindow.nm.w, 'nm.w', /return this\.\w+\[this\.\w+\]/);
                var clsPlayer = fnGetSongRaw[0];
                var fnGetSong = fnGetSongRaw[2];
                if (ScriptConfig_3.Config.bYellowEaseInternational) {
                    this._btnChangeCdn = $('<a>');
                    this._btnChangeCdn
                        .addClass('jx_btn jx_cdn')
                        .click(() => this.NextCdn())
                        .insertAfter(this._btnDownload)
                        .text('换');
                    var cdn = GM_getValue('_ws_cdn_media', null);
                    if (!cdn) {
                        this.NextCdn();
                    }
                    else {
                        this._cdn = cdn;
                    }
                }
                ////// 安装修改后的 取得曲目信息 函数开始
                var callEventFn = GenerateValidName();
                exportFunction((song) => {
                    var data = JSON.parse(song);
                    this._song = {
                        artists: data.artists.map((artist) => artist.name).join('、'),
                        name: data.name,
                        url: null
                    };
                    Logger_5.info(`捕捉到音乐切换: ${this._song.name}`);
                }, unsafeWindow, {
                    defineAs: callEventFn
                });
                unsafeExec((callEventFn, clsPlayer, fnGetSong) => {
                    var _getSongBackup = window.nm.w[clsPlayer].prototype[fnGetSong];
                    window.nm.w[clsPlayer].prototype[fnGetSong] = function () {
                        var r = _getSongBackup.call(this);
                        if (r !== undefined) {
                            window[callEventFn](JSON.stringify(r));
                        }
                        return r;
                    };
                }, callEventFn, clsPlayer, fnGetSong);
                ////// 安装修改后的 取得曲目信息 函数结束
                ////// 安装修改后的 Ajax 函数开始
                var ajaxPatchFn = GenerateValidName();
                this._ajaxBackup = unsafeWindow.nej.j[fnAjax];
                if (ScriptConfig_3.Config.bYellowEaseUseOldApi || ScriptConfig_3.Config.bYellowEaseInternational) {
                    let hookedAjax = (ScriptConfig_3.Config.bYellowEaseUseOldApi ? this.AjaxPatchedOldApi : this.AjaxPatchedInternational);
                    exportFunction(hookedAjax.bind(this), unsafeWindow, {
                        defineAs: ajaxPatchFn
                    });
                    unsafeExec((ajaxPatchFn, fnAjax) => {
                        var ajaxPatched = window[ajaxPatchFn];
                        var ajaxOriginal = window.nej.j[fnAjax];
                        window.nej.j[fnAjax] = CustomAjax;
                        function CustomAjax(url, params) {
                            // console.info(`url: ${url}`);
                            if (url.indexOf('log/') != -1) {
                                setTimeout(() => {
                                    params.onload({
                                        code: 200
                                    });
                                }, 100);
                                return;
                            }
                            if (!params.headers)
                                params.headers = {};
                            var _onload = params.onload;
                            // params._onload = params.onload;
                            params.onload = (data) => {
                                params.onload = _onload;
                                if (params._onload) {
                                    params._onload(data, _onload);
                                }
                                else {
                                    params.onload(data);
                                }
                            };
                            ajaxPatched(url, params);
                        }
                    }, ajaxPatchFn, fnAjax);
                }
                ////// 安装修改后的 Ajax 函数结束
                /// 挂钩下一首切换事件, 强制重新读取当前曲目地址。
                var fnNextSong = this.Search(unsafeWindow.nm.w[clsPlayer].prototype, `nm.w.${clsPlayer}.prototype`, '(+1),"ui")');
                unsafeExec((clsPlayer, fnNextSong) => {
                    var oldNextSong = window.nm.w[clsPlayer].prototype[fnNextSong];
                    var reloadSong = eval('(' + oldNextSong.toString().replace('1', '0') + ')');
                    window.nm.w[clsPlayer].prototype[fnNextSong] = function () {
                        window.nm.w[clsPlayer].prototype[fnNextSong] = oldNextSong;
                        return reloadSong.call(this);
                    };
                    document.querySelector('.nxt').click();
                }, clsPlayer, fnNextSong);
            });
        }
        AjaxPatchedOldApi(url, params) {
            if (url != '/api/song/enhance/player/url') {
                this._ajaxBackup(url, params);
                return;
            }
            url = '/api/v3/song/detail';
            let query = params.query;
            if (query.br)
                delete query.br;
            var _ids = JSON.parse(query.ids);
            var requestIds = [];
            this.LoadCache();
            var songs = _ids.map((id) => {
                if (id in this._songCache) {
                    return this._songCache[id];
                }
                requestIds.push(id);
                return null;
            }).filter((song) => {
                return song;
            });
            if (requestIds.length === 0) {
                Logger_5.info(`从缓存读取曲目信息。`);
                let reply = SongsToUrlReply(songs);
                this.NotifyUrlChange(reply.data[0].url);
                params.onload(reply);
                return;
            }
            Logger_5.info('请求服务器获取信息: %o', requestIds);
            params.query = {
                ids: requestIds
            };
            params._onload = exportFunction((data, _onload) => {
                this.LoadCache(false);
                data.songs.forEach((song) => {
                    this._songCache[song.id] = song;
                });
                this.SaveCache();
                let reply = SongsToUrlReply(_ids.map((id) => this._songCache[id]));
                this.NotifyUrlChange(reply.data[0].url);
                _onload(reply);
            }, unsafeWindow);
            this._ajaxBackup(url, params);
        }
        LoadCache(force = false) {
            if (force || this._reloadCache) {
                try {
                    this._songCache = JSON.parse(localStorage.__track_queue_cache);
                }
                catch (err) {
                    this._songCache = {};
                    localStorage.__track_queue_cache = '{}';
                }
            }
            this._reloadCache = false;
        }
        SaveCache() {
            localStorage.__track_queue_cache = JSON.stringify(this._songCache);
        }
        AjaxPatchedInternational(url, params, try_br) {
            if (url != '/api/song/enhance/player/url') {
                this._ajaxBackup(url, params);
                return;
            }
            document.cookie = 'os=uwp';
            params.headers['X-Real-IP'] = '118.88.88.88';
            var id = JSON.parse(params.query.ids)[0];
            params._onload = exportFunction((data, _onload) => {
                if (data.data[0].url) {
                    let url = this.InjectCdn(data.data[0].url);
                    _onload(UrlToSongUrlReply(id, url));
                    this.NotifyUrlChange(url);
                }
                else if (ScriptConfig_3.Config.bYellowEaseUseThridOnFail && !try_br) {
                    MusicSpy.Get(id, (err, url) => {
                        if (err) {
                            Logger_5.error(err);
                            return;
                        }
                        let cdn_url = this.InjectCdn(url);
                        _onload(UrlToSongUrlReply(id, cdn_url));
                        this.NotifyUrlChange(cdn_url);
                    });
                }
                ;
            }, unsafeWindow);
            this._ajaxBackup(url, params);
        }
        NotifyUrlChange(url) {
            this._song.url = url;
            this.OnSongChange();
        }
        OnSongChange() {
            this._btnDownload.attr({
                href: this._downloader.GenerateUri(this._song.url, `${this._song.name} [${this._song.artists}].mp3`),
                title: `下载: ${this._song.name}`
            });
        }
        InjectCdn(url) {
            var r = url.replace(/(m10\.music\.126\.net)/, `${this._cdn}/$1`);
            Logger_5.info(`播放音乐 (${r})`);
            return r;
        }
        NextCdn() {
            if (!this._cdns)
                this._cdns = GenerateCdnList();
            var ip = this._cdns.shift();
            this._cdns.push(ip);
            this.NotifyCdn(ip);
        }
        NotifyCdn(ip) {
            if (this._btnChangeCdn)
                this._btnChangeCdn.attr('title', `更换 CDN [当前: ${ip}]`);
            Logger_5.info(`使用 CDN: ${ip}`);
            this._cdn = ip;
            localStorage.ws_cdn_media = ip;
            GM_setValue("_ws_cdn_media", ip);
            document.dispatchEvent(new CustomEvent(Script_7.Script.Name + '-cdn', {
                detail: ip
            }));
        }
        HookRadioPlayer() {
        }
        FramePage() {
            switch (location.pathname.split('/')[1]) {
                case 'mv':
                    this.MoviePage();
                    break;
                case 'outchain':
                    this.OutchainPage();
                    break;
                case 'song':
                    this.SinglePage();
                    break;
                case 'album': // 专辑
                case 'artist': // 艺术家
                case 'playlist': // 播放列表
                case 'discover':
                    this.EnableItems();
                    break;
            }
        }
        MoviePage() {
            var $flashBox = $('#flash_box');
            if ($flashBox.length > 0) {
                var html = $flashBox.html();
                var params = qs.Parse(html.match(/flashvars="([\s\S]+?)"/)[1].replace(/&amp;/g, '&'));
                var qualities = {
                    hurl: '高清',
                    murl: '标清',
                    lurl: '渣画质'
                };
                var $dlHolder = $('<p>').css({
                    textAlign: 'right'
                }).text('MV 下载: ').insertAfter($flashBox);
                Object.keys(qualities).forEach((qualityId) => {
                    if (params[qualityId]) {
                        var $dl = $('<a>').attr({
                            href: this._downloader.GenerateUri(params[qualityId], `${params.trackName}[${qualities[qualityId]}].mp4`),
                            title: `下载 ${params.trackName} 的 ${qualities[qualityId]} Mv`
                        }).prop('download', true).text(qualities[qualityId]);
                        // 修正 163 自己的跳转.
                        this._downloader.CaptureAria($dl);
                        $dlHolder.append($dl);
                        $dlHolder.append(' | ');
                    }
                });
                $dlHolder.append(`提供: ${Script_7.Script.Name} ${Constants_3.version}`);
                if (ScriptConfig_3.Config.bYellowEaseInternational) {
                    $flashBox.html(html.replace(/restrict=true/g, 'restrict='));
                    // 自动关闭弹出的提示框
                    var timer = setInterval(function () {
                        var el = document.getElementsByClassName('zcls');
                        if (el.length > 0) {
                            el[0].dispatchEvent(new Event('mousedown'));
                            clearInterval(timer);
                        }
                    }, 100);
                }
            }
        }
        OutchainPage() {
            // TODO: 外链页面
        }
        SinglePage() {
            var timer = window.setInterval(() => {
                var playButton = document.getElementsByClassName('u-btni-addply');
                if (playButton.length == 1) {
                    window.clearInterval(timer);
                    return;
                }
                // Otherwise it should be a disabled button.
                var playButtons = document.getElementsByClassName('u-btni-play-dis');
                if (playButtons.length == 1) {
                    window.clearInterval(timer);
                    var songId = $('#content-operation').data('rid');
                    playButtons[0].outerHTML = `
<a data-res-action="play" data-res-id="${songId}" data-res-type="18" href="javascript:;"
  class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true" title="播放">
    <i><em class="ply"></em>播放</i>
</a>

<a data-res-action="addto" data-res-id="${songId}" data-res-type="18" href="javascript:;"
  class="u-btni u-btni-add" hidefocus="true" title="添加到播放列表">
</a>
                `;
                }
            }, 1000);
        }
        EnableItems() {
            var timer = window.setInterval(() => {
                var disbledItems = document.getElementsByClassName('js-dis');
                if (disbledItems.length === 0) {
                    window.clearInterval(timer);
                }
                for (var i = 0; i < disbledItems.length;) {
                    disbledItems[i].classList.remove('js-dis');
                }
            }, 1000);
        }
    }
    function TestString(src, needle) {
        if (typeof needle == 'string') {
            return Extension_7.Contains(src, needle);
        }
        else {
            return needle.test(src);
        }
    }
    function GenerateCdnList() {
        var cdns = [
            // 电信
            "125.90.206.32",
            "222.186.132.103",
            "117.23.6.89",
            "119.145.207.17",
            "180.97.180.71",
            "116.55.236.93",
            "218.76.105.42",
            "125.64.232.15",
            "115.231.87.37",
            "58.221.78.68",
            "220.112.195.148",
            "218.64.94.67",
            "36.42.32.76",
            "61.136.211.16",
            "218.64.94.68",
            "219.138.21.71",
            "49.79.232.58",
            "122.228.24.30",
            "182.106.194.85",
            "218.59.186.98",
            "61.158.133.21",
            "117.27.241.20",
            "58.51.150.133",
            "218.29.49.132",
            "60.215.125.76",
            "183.61.22.17",
            "183.134.14.26",
            "58.220.6.142",
            "115.231.158.44",
            "61.164.241.105",
            "125.46.22.124",
            "222.28.152.139",
            "124.165.216.244",
            "218.60.106.115",
            "202.107.85.81",
            "61.179.107.116",
            "175.43.20.69",
            "220.194.203.86",
            "61.160.209.27",
            "120.209.141.79",
            "120.209.142.138",
            "219.138.21.72",
            "58.216.21.132",
            '14.215.228.10',
            '218.87.111.83',
            // 北京电信
            '203.130.59.8',
            '203.130.59.10',
            '203.130.59.11',
            '203.130.59.12'
        ];
        return Extension_7.Shuffle(cdns);
    }
    function GenerateValidName() {
        return `${Script_7.Script.Name}__${Date.now()}${Math.random()}`;
    }
    function GetEnhancedData(id, url) {
        return {
            id: id,
            url: url,
            br: 192000,
            size: 120000,
            md5: '00000000000000000000000000000000',
            code: 200,
            expi: 1200,
            type: 'mp3',
            gain: 0,
            fee: 0,
            uf: null,
            payed: 0,
            canExtend: false
        };
    }
    function SongsToUrlReply(songs) {
        var reply = {
            code: 200,
            data: songs.map((song) => {
                return GetEnhancedData(song.id, GenerateUrlFromSong(song));
            })
        };
        return cloneInto(reply, unsafeWindow, {
            cloneFunctions: false,
            wrapReflectors: true
        });
    }
    function UrlToSongUrlReply(id, url) {
        var reply = {
            code: 200,
            data: [GetEnhancedData(id, url)]
        };
        return cloneInto(reply, unsafeWindow, {
            cloneFunctions: false,
            wrapReflectors: true
        });
    }
    function GenerateUrlFromSong(song) {
        var dfsId;
        var q = (song.h || song.m || song.l || song.a);
        if (!q) {
            Logger_5.error(`歌曲 ${song.name} 已经下架，获取地址失败!`);
            return __MP3_BLANK;
        }
        dfsId = q.fid;
        var randServer = ~~(Math.random() * 2) + 1;
        var ipPrefix = '';
        if (ScriptConfig_3.Config.bYellowEaseInternational) {
            if (ScriptConfig_3.Config.bYellowEaseUseOldApi) {
                ipPrefix = '127.0.0.1:4003/';
            }
            else {
                // TODO: 这些 Ip 有用嘛?
                ipPrefix = rule.instance._cdn;
            }
        }
        var dfsHash = DoDfsHash(dfsId);
        return `http://${ipPrefix}m${randServer}.music.126.net/${dfsHash}/${dfsId}.mp3`;
    }
    function strToKeyCodes(str) {
        return String(str).split('').map((ch) => ch.charCodeAt(0));
    }
    const keys = [
        51, 103, 111, 56, 38, 36,
        56, 42, 51, 42, 51, 104,
        48, 107, 40, 50, 41, 50
    ];
    function DoDfsHash(dfsid) {
        var fids = strToKeyCodes(dfsid).map(function (fid, i) {
            return (fid ^ keys[i % keys.length]) & 0xFF;
        });
        return CryptoJS.MD5(CryptoJS.lib.ByteArray(fids))
            .toString(CryptoJS.enc.Base64)
            .replace(/\//g, "_")
            .replace(/\+/g, "-");
    }
    var MusicSpy;
    (function (MusicSpy) {
        var _ready = false;
        var _reloadCache = true;
        var _cache = {};
        function Init() {
            _ready = true;
            Script_7.Script.RegisterStorageEvent('_MUSIC_SPY', () => {
                _reloadCache = true;
            });
            ReloadCache();
        }
        function ReloadCache(force = false) {
            if (force || _reloadCache) {
                try {
                    _cache = JSON.parse(localStorage._MUSIC_SPY);
                }
                catch (ex) {
                    _cache = {};
                }
            }
            _reloadCache = false;
        }
        function ReadCache(id) {
            if (_reloadCache)
                ReloadCache();
            return _cache[id];
        }
        function SaveCache() {
            localStorage._MUSIC_SPY = JSON.stringify(_cache);
        }
        function Get(id, callback) {
            if (!_ready)
                Init();
            Logger_5.info(`第一步: 搜索曲目 (${id})`);
            var cacheSong = ReadCache(id);
            if (cacheSong) {
                Logger_5.info(`读自缓存, 请求解析真实地址。`);
                ParseRealAddress(cacheSong, callback);
                // callback(null, cacheSong.url);
                return;
            }
            GM_xmlhttpRequest({
                method: "GET",
                url: `http://api.itwusun.com/music/search/wy/1?format=json&sign=a5cc0a8797539d3a1a4f7aeca5b695b9&keyword=${id}`,
                onload: (response) => {
                    var data;
                    try {
                        data = JSON.parse(response.responseText);
                    }
                    catch (err) {
                        callback(err);
                        return;
                    }
                    if (data.length === 0) {
                        callback(new Error('无效的曲目搜索结果。'));
                        return;
                    }
                    var song = data
                        .filter((song) => song.Type == 'wy' && song.SongId == id)
                        .pop();
                    if (!song) {
                        callback(new Error('找不到曲目信息。'));
                        return;
                    }
                    var url = song.SqUrl || song.HqUrl || song.LqUrl;
                    var songObj = {
                        time: Date.now(),
                        url: url,
                        real_time: 0,
                        real_url: null
                    };
                    _cache[id] = songObj;
                    SaveCache();
                    Logger_5.info(`成功取得地址, 请求解析真实地址。`);
                    ParseRealAddress(songObj, callback);
                    // callback(null, url);
                },
                onerror: () => {
                    callback(new Error('网络错误 (搜索曲目)'));
                }
            });
        }
        MusicSpy.Get = Get;
        // 四小时后过期
        // 1000 * 60 * 60 *4 == 14400000
        function ParseRealAddress(cacheSong, callback) {
            Logger_5.info(`第二步: 解析真实地址 (${cacheSong.url})`);
            if (Date.now() - cacheSong.real_time < 14400000) {
                Logger_5.info(`读自缓存，结束读取。`);
                callback(null, cacheSong.real_url);
                return;
            }
            GM_xmlhttpRequest({
                method: "GET",
                url: cacheSong.url,
                headers: {
                    Range: 'bytes=0-2'
                },
                onload: (response) => {
                    cacheSong.real_url = response.finalUrl;
                    cacheSong.real_time = Date.now();
                    SaveCache();
                    Logger_5.info(`解析结束: ${cacheSong.real_url}`);
                    callback(null, response.finalUrl);
                },
                onerror: () => {
                    callback(new Error('网络错误 (解析真实地址时)'), null);
                }
            });
        }
    })(MusicSpy || (MusicSpy = {}));
});
define("site/music.1ting", ["require", "exports", "helper/Wait", "helper/Downloader"], function (require, exports, Wait_6, Downloader_5) {
    "use strict";
    var rule = {
        id: 'music.1ting',
        ssl: false,
        name: '一听音乐',
        host: 'www.1ting.com',
        includeSubHost: false,
        subModule: false,
        css: ``,
        bd: null,
        _dl: null,
        onStart: () => {
            rule.bd = new Downloader_5.Downloader();
        },
        onBody: () => {
            rule._dl = $('.songact > .down');
            rule._dl
                .removeAttr('onclick')
                .attr('target', '_blank');
            rule.bd.CaptureAria(rule._dl);
            Wait_6.WaitUntil('yiting.player.hook', () => {
                unsafeWindow.yiting.player.hook('play', exportFunction(() => {
                    rule.UpdateSong();
                }, unsafeWindow));
                rule.UpdateSong();
            });
        },
        UpdateSong: () => {
            var name = unsafeWindow.yiting.player.get('song-name');
            var singer = unsafeWindow.yiting.player.get('singer-name');
            var link = unsafeWindow.yiting.player.host + unsafeWindow.yiting.player.get('song-media');
            rule._dl.attr({
                href: rule.bd.GenerateUri(link, `${name} [${singer}].mp3`),
                title: `点我下载: ${name}`
            });
        }
    };
    exports.Rules = [rule];
});
define("hooker/jPlayer", ["require", "exports", "helper/Logger", "helper/Wait"], function (require, exports, Logger_6, Wait_7) {
    "use strict";
    /// <reference path="../typings/globals/jquery/index.d.ts" />
    function Patch(callback, namespace = "jPlayer") {
        Logger_6.info('等待 jPlayer 就绪 ..');
        Wait_7.WaitUntil(`$.${namespace}.prototype.setMedia`, () => {
            Logger_6.info('开始绑定函数 ..');
            unsafeOverwriteFunctionSafeProxy({
                setMedia: (newMedia) => {
                    Logger_6.info('歌曲数据: ', newMedia);
                    callback(newMedia);
                    throw new ErrorUnsafeSuccess();
                }
            }, unsafeWindow.$[namespace].prototype, `.$.${namespace}.prototype`);
        });
    }
    exports.Patch = Patch;
});
define("site/music.56", ["require", "exports", "helper/Downloader", "helper/Script", "helper/Extension", "hooker/jPlayer"], function (require, exports, Downloader_6, Script_8, Extension_8, jPlayer) {
    "use strict";
    var rule = {
        id: 'music.56',
        ssl: false,
        name: '56 音乐网',
        host: 'www.23356.com',
        path: ['/plus/player.ashx', '/ting/', '/music/'],
        includeSubHost: false,
        subModule: false,
        hide: '.player-bottom-gg, .nocopyright',
        bd: null,
        onStart: () => {
            rule.bd = new Downloader_6.Downloader();
        },
        onBody: () => {
            jPlayer.Patch((media) => {
                var addr = media.mp3 || media.m4a;
                $('.play-info-otheropt > a:last')
                    .attr('href', rule.bd.GenerateUri(addr, media.songname + addr.slice(-4)))
                    .attr('title', `下载: ${media.songname} (歌手: ${media.singername})`)
                    .find('span').text(`下载 (${Script_8.Script.Name})`);
            });
            var need_play = false;
            unsafeWindow.splayer.song_data[0].forEach((song) => {
                if (song.delflag || song.delflag != 0) {
                    need_play = true;
                    song.delflag = 0;
                    if (Extension_8.BeginWith(song.url, '/del')) {
                        song.url = song.url.replace('/del', '');
                    }
                }
            });
            if (need_play) {
                unsafeWindow.$('#play').click();
            }
        }
    };
    exports.Rules = [rule];
});
define("site/music.echo", ["require", "exports", "helper/Logger", "helper/Wait", "helper/Downloader", "helper/Extension"], function (require, exports, Logger_7, Wait_8, Downloader_7, Extension_9) {
    "use strict";
    var rule = {
        id: 'music.echo',
        ssl: false,
        name: 'Echo 回声音乐',
        host: 'www.app-echo.com',
        path: '/sound/',
        includeSubHost: false,
        subModule: false,
        hide: '',
        bd: null,
        dlLink: null,
        onStart() {
            rule.bd = new Downloader_7.Downloader();
        },
        onBody() {
            if (Extension_9.BeginWith(location.pathname, '/sound/')) {
                rule.SinglePage();
            }
        },
        SinglePage() {
            // 单曲页面
            // http://www.app-echo.com/sound/info-mobile?sound_id=${id}
            var id = location.pathname.match(/\d+/);
            if (!id) {
                Logger_7.error('获取曲目 ID 失败!');
                return;
            }
            // 插入下载连接x
            var smallText = $('<small>');
            var urlDl = $('<a>');
            $('.single-title > h1').append(smallText);
            smallText.append(urlDl);
            rule.dlLink = urlDl;
            urlDl.text('下载')
                .attr('title', '正在解析...')
                .css('margin-left', '1em');
            var frame = document.createElement('iframe');
            frame.src = 'about:blank';
            document.body.appendChild(frame);
            unsafeWindow.onerror = null;
            var req = {
                method: 'GET',
                url: `/sound/info-mobile?sound_id=${id}`,
                onload: (response) => {
                    var target = $(response.responseText)
                        .filter('script')
                        .filter((i, el) => Extension_9.Contains(el.textContent, 'play_source('));
                    if (target.length === 0) {
                        Logger_7.error('搜索不到有效的曲目代码。');
                        return;
                    }
                    // 导出我们的函数
                    var wnd = frame.contentWindow;
                    exportFunction((id, type, url, unk) => {
                        Wait_8.WaitUntil('page_sound_obj', () => rule.UpdateUrl(url, unsafeWindow.page_sound_obj.name));
                    }, wnd, {
                        defineAs: 'play_source'
                    });
                    // 执行捕捉到的元素
                    var s = wnd.document.createElement('script');
                    s.textContent = target.text();
                    wnd.document.body.appendChild(s);
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36'
                }
            };
            GM_xmlhttpRequest(req);
        },
        UpdateUrl(url, name) {
            let s = Extension_9.Contains(url, '?') ? '&' : '?';
            let _url = `${url}${s}attname=${encodeURIComponent(name)}${Extension_9.GetExtensionFromUrl(url)}`;
            rule.dlLink
                .attr('href', rule.bd.GenerateUri(url, name + Extension_9.GetExtensionFromUrl(url)))
                .attr('title', `下载: ${name}`);
            // info(`捕捉到下载地址: ${url}`);
        }
    };
    exports.Rules = [rule];
});
define("site/music.kugou", ["require", "exports", "helper/Logger", "helper/Downloader", "helper/ScriptConfig", "helper/Extension"], function (require, exports, Logger_8, Downloader_8, ScriptConfig_4, Extension_10) {
    "use strict";
    const KugouDownloadFront = 'https://jixunmoe.github.io/cuwcl4c/kugou-dl';
    var app = null;
    var rule = {
        id: 'music.kugou',
        ssl: false,
        name: '酷狗音乐',
        host: 'web.kugou.com',
        includeSubHost: false,
        subModule: false,
        hide: '#adv, .jx-hide',
        css: `
.dialog-shadow {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	background: rgba(0,0,0,.3);
	z-index: 100;
}

.dialog-container {
	min-width: calc(768px + 2em);
	min-height: 20em;
	padding: 1em;
	background: #fff;
	box-shadow: 2px 2px 2px #666;
	border: 1px solid rgba(6,6,6,.3);
	position: relative;
	padding-top: 2.5em;
}

.dialog-title-bar {
	position: absolute;
	left: 0;
	top: 0;
	padding: .4em;
	width: calc(100% - .8em);
	border-bottom: 1px solid white;
	background: #00A7F2;
	color: white;
}

.dialog-title-btns {
	float: right;
}

.dialog-title-btns > .dialog-bar-btn {
	width: 1em;
	height: 1em;
	border: 1px solid white;
	text-align: center;
	line-height: 1.2;
	padding: 0 .5em;
	margin-left: .5em;
	cursor: pointer;
}

.dialog-content iframe {
	height: 30em;
	width: 100%;
}
`,
        bd: null,
        onStart() {
            rule.bd = new Downloader_8.Downloader();
        },
        onBody() {
            // 火狐狸有兼容问题, 待修
            if (!Extension_10.Contains(navigator.userAgent, 'Firefox'))
                rule.BuildDialog();
        },
        BuildDialog() {
            let downloader = $(`<div id="jixun-dl">
	<div class="dialog-shadow" v-bind:class="{ 'jx-hide': hideWindow }">
		<div class="dialog-container">
			<div class="dialog-title-bar">
				下载窗口

				<div class="dialog-title-btns">
					<span class="dialog-bar-btn" v-on:click="toggleFrame">管</span>
					<span class="dialog-bar-btn" v-on:click="hide">关</span>
				</div>
			</div>

			<div class="dialog-content">
				<div v-bind:class="{ 'jx-hide': hideMsg }">{{ msg }}</div>
				<iframe v-el:frame-dl-dialog v-bind:class="{ 'jx-hide': mode != 1 }" src="${KugouDownloadFront}"></iframe>
				<iframe v-el:frame-dl-manager v-bind:class="{ 'jx-hide': mode != 2 }"  src="${KugouDownloadFront}/dl.html"></iframe>
			</div>
		</div>
	</div>
</div>`);
            downloader.appendTo(document.body);
            // Require VueJS from resource.
            let vueLoader = new Function('window', GM_getResourceText('VueJs') + '\n; return window.Vue;');
            let Vue = vueLoader(unsafeWindow);
            app = new Vue({
                el: downloader[0],
                data: {
                    msg: '正在获取相关数据...',
                    hideMsg: false,
                    mode: 0,
                    hideWindow: false
                },
                methods: {
                    init() {
                        app.hideWindow = true;
                    },
                    toggleFrame() {
                        if (app.mode == 1) {
                            app.mode = 2;
                        }
                        else {
                            app.mode = 1;
                        }
                    },
                    hide() {
                        app.hideWindow = !app.hideWindow;
                    }
                }
            });
            app.init();
            var actionDlDialog = ['set', 'clear'];
            var actionDlManager = ['add'];
            function post(action, data) {
                var frame = actionDlDialog.indexOf(action) != -1 ? app.$els.frameDlDialog : app.$els.frameDlManager;
                var msg = {
                    action: action,
                    data: data
                };
                frame.contentWindow.postMessage(JSON.stringify(msg), '*');
            }
            // 获取音质信息
            function handleDownload(songs) {
                post('clear');
                app.hideMsg = false;
                app.mode = 0; // hideThem
                app.hideWindow = false;
                var resource = JSON.parse(songs).map((song) => ({
                    type: 'audio',
                    id: 0,
                    hash: song.Hash
                }));
                var payload = {
                    "userid": 0,
                    "token": "",
                    "vip": 1,
                    "behavior": "download",
                    "relate": 1,
                    "resource": resource,
                    "appid": 1001,
                    "clientver": "8031",
                    "source": {
                        "module": "1",
                        "type": "0",
                        "id": 0
                    }
                };
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "http://media.store.kugou.com/v1/get_res_privilege",
                    data: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function (response) {
                        post('set', JSON.parse(response.responseText));
                        app.hideMsg = true;
                        app.mode = 1; // 展现下载管理界面
                    },
                    onerror: function () {
                        alert('接口获取失败, 请稍后重试!');
                        app.hideWindow = true;
                    }
                });
            }
            var looper = new IntervalLoop([], proc_hash, 500);
            looper.loop();
            window.addEventListener("message", onMessage, false);
            function onMessage(e) {
                var data = JSON.parse(e.data);
                if (data.action == 'cancel') {
                    app.hideWindow = true;
                }
                else if (data.action == 'download') {
                    app.mode = 2;
                    looper.add.apply(looper, data.data);
                }
                else {
                    Logger_8.error('Undefined action: ' + data.action);
                }
            }
            function handle_dl(song) {
                var file = song.fileName + '.' + song.extName;
                var url = song.url;
                post('add', song);
                if (ScriptConfig_4.Config.dUriType == ScriptConfig_4.UriType.Aria) {
                    rule.bd.AddDownload(url, file);
                }
            }
            function proc_hash(next, hash) {
                hash = hash.toLowerCase();
                var key = CryptoJS.MD5(hash + 'kgcloud').toString();
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'http://trackercdn.kugou.com/i/?cmd=4&hash=' + hash + '&key=' + key + '&pid=1&forceDown=0&vip=1',
                    onload: function (response) {
                        var song = JSON.parse(response.responseText);
                        handle_dl(song);
                        next();
                    },
                    onerror: function () {
                        Logger_8.error('Error while fetching data for %s', hash);
                        next();
                    }
                });
            }
            /* 导出函数 */
            exportFunction(handleDownload, unsafeWindow, {
                defineAs: "dl_jixun"
            });
            unsafeExec(function () {
                window.downLoad = function () {
                    try {
                        window.dl_jixun.apply(this, arguments);
                    }
                    catch (err) {
                        console.error(err);
                    }
                };
            });
        }
    };
    exports.Rules = [rule];
});
define("Rules", ["require", "exports", "SiteRule", "site/AA.Config", "site/dl.123564", "site/dl.5xfile", "site/dl.baidu", "site/dl.howfile", "site/dl.namipan.cc", "site/dl.phpdisk", "site/dl.xuite", "site/dl.yimuhe", "site/fm.douban", "site/fm.moe", "site/music.163", "site/music.1ting", "site/music.56", "site/music.echo", "site/music.kugou"], function (require, exports, SiteRule_1, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    "use strict";
    a.Rules.forEach(SiteRule_1.Add);
    b.Rules.forEach(SiteRule_1.Add);
    c.Rules.forEach(SiteRule_1.Add);
    d.Rules.forEach(SiteRule_1.Add);
    e.Rules.forEach(SiteRule_1.Add);
    f.Rules.forEach(SiteRule_1.Add);
    g.Rules.forEach(SiteRule_1.Add);
    h.Rules.forEach(SiteRule_1.Add);
    i.Rules.forEach(SiteRule_1.Add);
    j.Rules.forEach(SiteRule_1.Add);
    k.Rules.forEach(SiteRule_1.Add);
    l.Rules.forEach(SiteRule_1.Add);
    m.Rules.forEach(SiteRule_1.Add);
    n.Rules.forEach(SiteRule_1.Add);
    o.Rules.forEach(SiteRule_1.Add);
    p.Rules.forEach(SiteRule_1.Add);
});
define("EntryPoint", ["require", "exports", "helper/Script", "helper/Constants", "helper/ScriptConfig", "helper/QueryString", "helper/Logger", "SiteRule"], function (require, exports, Script_9, Constants_4, ScriptConfig_5, QueryString_1, Logger_9, SiteRule_2) {
    "use strict";
    var $_GET = QueryString_1.Parse(Constants_4.currentUrl);
    if (ScriptConfig_5.Config.bUseCustomRules) {
        var customRules = [];
        try {
            customRules = eval(`[${ScriptConfig_5.Config.sCustomRule}]`);
            customRules.forEach((rule) => {
                SiteRule_2.Sites.push(rule);
            });
        }
        catch (ex) {
            Logger_9.error(`解析自定义规则发生错误: ${ex.message}`);
        }
    }
    GM_registerMenuCommand(`配置 ${Script_9.Script.Name}`, () => {
        GM_openInTab(Script_9.Script.Config, false);
    });
    SiteRule_2.FireEvent('start');
    $(() => {
        SiteRule_2.FireEvent('body');
    });
});
