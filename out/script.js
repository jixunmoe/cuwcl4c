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

// @author         Jixun.Moe<Yellow Yoshi>
// @namespace      http://jixun.org/
// @version        4.0.636

// 尝试使用脚本生成匹配规则
// ////               [Include Rules]

// @include http://localhost.cuwcl4c/*
// @include http://jixunmoe.github.io/*
// @include http://123564.com/*
// @include http://m.123564.com/*
// @include http://123564.com/*
// @include http://m.123564.com/*
// @include http://yun.baidu.com/*
// @include http://pan.baidu.com/*
// @include http://howfile.com/*
// @include http://*.howfile.com/*
// @include http://namipan.cc/*
// @include http://*.namipan.cc/*
// @include http://webhd.xuite.net/*
// @include http://sync.hamicloud.net/*
// @include http://douban.fm/*
// @include https://douban.fm/*
// @include http://moe.fm/*
// @include http://music.163.com/*
// @include https://jixunmoe.github.io/cuwcl4c/config/

// GM_xmlHttpRequest 远端服务器列表
// @connect down.lepan.cc
// @connect music.baidu.com
// @connect yinyueyun.baidu.com
// @connect media.store.kugou.com
// @connect trackercdn.kugou.com
// @connect yinyuetai.com
// @connect itwusun.com

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
define("site/dl.5xfile", ["require", "exports", "helper/Extension", "helper/Redirect"], function (require, exports, Extension_6, Redirect_2) {
    "use strict";
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
                Redirect_2.RedirectTo(url);
            }
            else if (Extension_6.Contains(location.pathname, '/downpanel.asp')) {
                // 第三页 - 最终下载地址展示
                url = $("div > a[href*='/down.asp']").attr('href');
                Redirect_2.RedirectTo(url);
            }
            else {
                // 第二页: 填写验证码
                $('#download > a').click();
            }
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
define("site/dl.xuite", ["require", "exports"], function (require, exports) {
    "use strict";
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
define("site/fm.douban", ["require", "exports", "helper/Logger", "helper/Wait", "helper/Downloader"], function (require, exports, Logger_4, Wait_3, Downloader_2) {
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
            Wait_3.WaitUntil('extStatusHandler', function () {
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
define("site/fm.moe", ["require", "exports", "helper/Downloader", "helper/Script"], function (require, exports, Downloader_3, Script_5) {
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
            Script_5.Script.ListenEvent((clip) => {
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
            }, Script_5.Script.Name);
        }
    };
    exports.Rules = [rule];
});
define("site/music.163", ["require", "exports", "helper/Logger", "helper/Constants", "helper/Wait", "helper/Downloader", "helper/Script", "helper/ScriptConfig", "helper/QueryString", "helper/Extension"], function (require, exports, Logger_5, Constants_3, Wait_4, Downloader_4, Script_6, ScriptConfig_3, qs, Extension_7) {
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
            Wait_4.WaitUntil('nm.x', () => {
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
        Search(base, displayBase, keyword) {
            for (let itemName in base) {
                if (base.hasOwnProperty(itemName)) {
                    let fn = base[itemName];
                    if (fn && typeof fn == 'function') {
                        let fnStr = String(fn);
                        if (TestString(fnStr, keyword)) {
                            Logger_5.info(`定位查找 %c${keyword}%c 成功: %c${displayBase}.${itemName}`, 'color: darkviolet', 'reset', 'color: green');
                            return itemName;
                        }
                    }
                }
            }
            Logger_5.error(`定位查找 ${keyword} 失败, 请联系作者修复!`);
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
            Wait_4.WaitUntil(() => {
                return document.querySelector('.listhdc > .addall') != null;
            }, () => {
                var dlLine = $('<a>');
                dlLine
                    .addClass('line jx_dl_line')
                    .hide();
                this._btnDownloadAll
                    .insertBefore('.m-playbar .listhdc .addall')
                    .after(dlLine);
            }, true, 500);
            function nextSong() {
                document.querySelector('.nxt').click();
            }
            Wait_4.WaitUntil('nej.j', () => {
                var fnAjax = this.Search(unsafeWindow.nej.j, "nej.j", '.replace("api","weapi');
                var fnGetSong = this.Search(unsafeWindow.nm.w.pP.prototype, 'nm.w.pP.prototype', /return this\.\w+\[this\.\w+\]/);
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
                unsafeExec((callEventFn, fnGetSong) => {
                    var _getSongBackup = window.nm.w.pP.prototype[fnGetSong];
                    window.nm.w.pP.prototype[fnGetSong] = function () {
                        var r = _getSongBackup.call(this);
                        window[callEventFn](JSON.stringify(r));
                        return r;
                    };
                }, callEventFn, fnGetSong);
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
                var fnNextSong = this.Search(unsafeWindow.nm.w.pP.prototype, 'nm.w.pP.prototype', '(+1),"ui")');
                unsafeExec((fnNextSong) => {
                    var oldNextSong = window.nm.w.pP.prototype[fnNextSong];
                    var reloadSong = eval('(' + oldNextSong.toString().replace('1', '0') + ')');
                    window.nm.w.pP.prototype[fnNextSong] = function () {
                        window.nm.w.pP.prototype[fnNextSong] = oldNextSong;
                        return reloadSong.call(this);
                    };
                    document.querySelector('.nxt').click();
                }, fnNextSong);
            });
        }
        AjaxPatchedOldApi(url, params) {
            if (url != '/api/song/enhance/player/url') {
                return this._ajaxBackup(url, params);
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
                return;
            }
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
            document.dispatchEvent(new CustomEvent(Script_6.Script.Name + '-cdn', {
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
                $dlHolder.append(`提供: ${Script_6.Script.Name} ${Constants_3.version}`);
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
        return `${Script_6.Script.Name}__${Date.now()}${Math.random()}`;
    }
    function SongsToUrlReply(songs) {
        var reply = {
            code: 200,
            data: songs.map((song) => {
                var r = {
                    id: song.id,
                    url: GenerateUrlFromSong(song),
                    br: 192000,
                    size: 0,
                    md5: '0000000000000000',
                    code: 200,
                    expi: 1200,
                    type: 'mp3',
                    gain: 0,
                    fee: 0,
                    uf: null,
                    payed: 0,
                    canExtend: false
                };
                return r;
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
            data: [{
                    id: id,
                    url: url,
                    br: 192000,
                    size: 0,
                    md5: '0000000000000000',
                    code: 200,
                    expi: 1200,
                    type: 'mp3',
                    gain: 0,
                    fee: 0,
                    uf: null,
                    payed: 0,
                    canExtend: false
                }]
        };
        return cloneInto(reply, unsafeWindow, {
            cloneFunctions: false,
            wrapReflectors: false
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
            Script_6.Script.RegisterStorageEvent('_MUSIC_SPY', () => {
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
                url: `http://itwusun.com/search/wy/${id}?p=1&f=json&sign=itwusun`,
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
define("Rules", ["require", "exports", "SiteRule", "site/AA.Config", "site/dl.123564", "site/dl.5xfile", "site/dl.baidu", "site/dl.howfile", "site/dl.namipan.cc", "site/dl.xuite", "site/fm.douban", "site/fm.moe", "site/music.163"], function (require, exports, SiteRule_1, a, b, c, d, e, f, g, h, i, j) {
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
});
define("EntryPoint", ["require", "exports", "helper/Script", "helper/Constants", "helper/ScriptConfig", "helper/QueryString", "helper/Logger", "SiteRule"], function (require, exports, Script_7, Constants_4, ScriptConfig_4, QueryString_1, Logger_6, SiteRule_2) {
    "use strict";
    var $_GET = QueryString_1.Parse(Constants_4.currentUrl);
    if (ScriptConfig_4.Config.bUseCustomRules) {
        var customRules = [];
        try {
            customRules = eval(`[${ScriptConfig_4.Config.sCustomRule}]`);
            customRules.forEach((rule) => {
                SiteRule_2.Sites.push(rule);
            });
        }
        catch (ex) {
            Logger_6.error(`解析自定义规则发生错误: ${ex.message}`);
        }
    }
    GM_registerMenuCommand(`配置 ${Script_7.Script.Name}`, () => {
        GM_openInTab(Script_7.Script.Config, false);
    });
    SiteRule_2.FireEvent('start');
    $(() => {
        SiteRule_2.FireEvent('body');
    });
});
