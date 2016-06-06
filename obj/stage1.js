define("helper/Script", ["require", "exports"], function (require, exports) {
    "use strict";
    var Script;
    (function (Script) {
        Script.Name = "CUWCL4C";
        Script.Home = "https://greasyfork.org/zh-CN/scripts/2600";
        Script.Config = "https://jixunmoe.github.io/cuwcl4c/config/";
        Script.Feedback = "https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600";
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
    exports.topHostMask = "." + exports.topHost;
    exports.downloadIcon = 'jx_dl';
    exports.downloadIconClass = '.jx_dl';
    function _isFrame() {
        try {
            return unsafeWindow.top !== unsafeWindow.self;
        }
        catch (e) {
            return true;
        }
    }
});
define("typings/GM_Aria2RPC", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (AriaAuthType) {
        AriaAuthType[AriaAuthType["NoAuth"] = 0] = "NoAuth";
        AriaAuthType[AriaAuthType["HttpBasicAuth"] = 1] = "HttpBasicAuth";
        AriaAuthType[AriaAuthType["SecretAuth"] = 2] = "SecretAuth";
    })(exports.AriaAuthType || (exports.AriaAuthType = {}));
    var AriaAuthType = exports.AriaAuthType;
});
define("helper/ScriptConfig", ["require", "exports", "helper/Script", "typings/GM_Aria2RPC"], function (require, exports, Script_1, GM_Aria2RPC_1) {
    "use strict";
    (function (UriType) {
        UriType[UriType["NormalUrl"] = 0] = "NormalUrl";
        /** @deprecated use others instead. */
        UriType[UriType["Custom"] = 1] = "Custom";
        UriType[UriType["Aria"] = 2] = "Aria";
    })(exports.UriType || (exports.UriType = {}));
    var UriType = exports.UriType;
    exports.Config = $.extend({
        bDiaplayLog: true,
        bInternational: false,
        bUseCustomRules: false,
        bUseThridOnFail: false,
        dAria_auth: GM_Aria2RPC_1.AriaAuthType.NoAuth,
        dAria_port: 6800,
        dUriType: UriType.NormalUrl,
        sAria_dir: "D:\\Download\\",
        sAria_host: "127.0.0.1",
        sAria_pass: "",
        sAria_user: "",
        sCustomRule: ""
    }, ReadConfig());
    function ReadConfig() {
        try {
            return JSON.parse(GM_getValue(Script_1.Script.Name, ""));
        }
        catch (ex) {
            return {};
        }
    }
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
    function Shuffle() {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i - 0] = arguments[_i];
        }
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
        for (var i = size; i--;) {
            if (ele.childNodes[i].name == 'flashvars') {
                flashObject = ele.childNodes[i];
                flashObject.value.replace(/&amp;/g, '&')
                    .replace(/([\s\S]+?)=([\s\S]+?)(&|$)/g, function (n, key, value) {
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
define("helper/Logger", ["require", "exports", "helper/Script", "helper/ScriptConfig"], function (require, exports, Script_2, ScriptConfig_1) {
    "use strict";
    function DoLog(prefix, method, args) {
        if (args.length < 1)
            return;
        if (typeof args[0] == 'string') {
            args[0] = "[" + Script_2.Script.Name + "][" + prefix + "] " + args[0];
        }
        else {
            args.splice(0, 0, "[" + Script_2.Script.Name + "][" + prefix + "] " + args[0]);
        }
        console[method].apply(console, args);
    }
    function WrapLog(prefix, method) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return DoLog(prefix, method, args);
        };
    }
    function DoNothing() { }
    exports.log = DoNothing;
    exports.info = DoNothing;
    exports.error = DoNothing;
    exports.warn = DoNothing;
    if (ScriptConfig_1.Config.bDiaplayLog) {
        exports.log = WrapLog('日志', 'log');
        exports.info = WrapLog('信息', 'info');
        exports.error = WrapLog('错误', 'error');
        exports.warn = WrapLog('警告', 'warn');
    }
});
define("helper/StyleSheet", ["require", "exports"], function (require, exports) {
    "use strict";
    var StyleSheet = (function () {
        function StyleSheet() {
        }
        StyleSheet.prototype.StyleSheet = function () {
            this.style = document.createElement('style');
            this.Apply();
        };
        StyleSheet.prototype.Add = function () {
            var styleText = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                styleText[_i - 0] = arguments[_i];
            }
            this.style.textContent += '\n' + styleText.join('\n');
        };
        StyleSheet.prototype.Hide = function (selector) {
            var selectors = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                selectors[_i - 1] = arguments[_i];
            }
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = selectors.join(', ') + " { display: none !important }";
            this.Add(styleText);
        };
        StyleSheet.prototype.Show = function (selector) {
            var selectors = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                selectors[_i - 1] = arguments[_i];
            }
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = selectors.join(', ') + " { display: block !important }";
            this.Add(styleText);
        };
        StyleSheet.prototype.HideFrames = function () {
            this.Hide('frame, iframe, frameset');
        };
        StyleSheet.prototype.Apply = function (body) {
            if (body === void 0) { body = true; }
            if (body && document.body) {
                document.body.appendChild(this.style);
            }
            else {
                document.head.appendChild(this.style);
            }
        };
        return StyleSheet;
    }());
    exports.StyleSheet = StyleSheet;
});
define("SiteRule", ["require", "exports", "helper/Constants", "helper/Extension", "helper/StyleSheet", "helper/Logger"], function (require, exports, Constants_1, Extension_2, StyleSheet_1, Logger_1) {
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
            return Extension_2.BeginWith(path, rule);
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
        var hosts = site.host.map(function (host) {
            return host.toLowerCase();
        });
        if (!Extension_2.Contains(hosts, Constants_1.lowerHost)) {
            if (site.noSubHost)
                return false;
            var matched = false;
            for (var i = hosts.length; i--;) {
                if (Extension_2.EndWith(hosts[i], Constants_1.topHostMask)) {
                    matched = true;
                    break;
                }
            }
            if (!matched)
                return false;
        }
        if (site.path) {
            return this.checkPath(location.pathname, site.path);
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
            if (Constants_1.isFrame && rule.noFrame)
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
                Logger_1.error("\u65E0\u6548\u7684\u4E8B\u4EF6 " + eventName);
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
                site.style.Add("\n            \n@font-face {\n\tfont-family: ccc;\n\tsrc: url(https://cdn.bootcss.com/font-awesome/4.2.0/fonts/fontawesome-webfont.woff) format('woff');\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n" + Constants_1.downloadIconClass + "::before {\n\tfont-family: ccc;\n\tcontent: \"\f019\";\n\tpadding-right: .5em;\n}\n\n.jx_hide {\n\tdisplay: none;\n}\n\n            ");
            }
        }
        if (!event)
            return;
        Logger_1.info("\u6267\u884C\u89C4\u5219: " + site.id + " \u4E8E " + site.name + " [\u4E8B\u4EF6: " + eventName + "]");
    }
    exports.Run = Run;
});
define("helper/BatchDownload", ["require", "exports", "helper/Script", "helper/ScriptConfig", "helper/Extension", "typings/GM_Aria2RPC"], function (require, exports, Script_3, ScriptConfig_2, Extension_3, GM_Aria2RPC_2) {
    "use strict";
    var config = ScriptConfig_2.Config;
    var BatchDownload = (function () {
        function BatchDownload() {
            this._captured = false;
        }
        BatchDownload.prototype.BatchDownload = function () {
        };
        BatchDownload.prototype.GenerateUrlPart = function (url, filename, ref) {
            return url + "|" + this.GetReferrerUrl(filename) + "|" + this.GetReferrerUrl(ref);
        };
        BatchDownload.prototype.GetReferrerUrl = function (url) {
            return String(url || location.href).replace(/#.*/, '');
        };
        BatchDownload.prototype.NormaliseFilename = function (filename) {
            return String(filename).replace(/['"\/\\:|]/g, '_');
        };
        BatchDownload.prototype.GenerateUri = function (url, filename, ref) {
            switch (config.dUriType) {
                case ScriptConfig_2.UriType.Custom:
                    return "cuwcl4c://|1|" + this.GenerateUrlPart(url, filename, ref);
                case ScriptConfig_2.UriType.Aria:
                    if (!this._captured)
                        this.CaptureAria();
                    return "aria2://|" + this.GenerateUrlPart(url, filename, ref);
            }
            return url;
        };
        BatchDownload.prototype.CaptureAria = function (el) {
            var _this = this;
            this._captured = true;
            this.SetupAria(false);
            if (!el)
                el = document.body;
            $(el).click(function (e) {
                var el = e.target;
                var $el = $(el);
                var linkEl = ($el.is('a') ? el : $el.parents('a')[0]);
                if (linkEl && linkEl.tagName == 'A' && Extension_3.BeginWith(linkEl.href, 'aria2://|')) {
                    e.stopPropagation();
                    e.preventDefault();
                    var link = linkEl.href.split('|');
                    _this.AddToAria(link[1], decodeURIComponent(link[2]), link[3], linkEl.classList.contains('aria-cookie'));
                }
            });
        };
        BatchDownload.prototype.AddToAria = function (url, filename, referer, cookie, headers) {
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
            this.aria.addUri([url], ariaParam, function (r) { }, function (b, r) {
                var sErrorMsg;
                if (r.error) {
                    sErrorMsg = "\u9519\u8BEF\u4EE3\u7801 " + r.error.code + ": " + r.error.message;
                }
                else {
                    sErrorMsg = "与 Aria2 后台通信失败, 服务未开启?";
                }
                alert("[" + Script_3.Script.Name + "] \u63D0\u4EA4\u4EFB\u52A1\u53D1\u751F\u9519\u8BEF!\n\n" + sErrorMsg);
            });
        };
        BatchDownload.prototype.SetupAria = function (forceSetup) {
            if (forceSetup || !this.aria) {
                this.aria = new GM_Aria2RPC_2.Aria({
                    auth: {
                        type: config.dAria_auth,
                        user: config.sAria_user,
                        pass: config.sAria_pass
                    },
                    host: config.sAria_host,
                    port: config.dAria_port
                });
            }
        };
        BatchDownload.prototype.AddDownload = function (url, file) {
            if (config.dUriType == ScriptConfig_2.UriType.Aria) {
                this.AddToAria(url, file);
            }
            else {
                GM_openInTab(this.GenerateUri(url, file), true);
            }
        };
        return BatchDownload;
    }());
    exports.BatchDownload = BatchDownload;
});
define("site/AA.Config", ["require", "exports", "helper/Constants", "helper/ScriptConfig", "helper/Script", "helper/BatchDownload"], function (require, exports, Constants_2, ScriptConfig_3, Script_4, BatchDownload_1) {
    "use strict";
    var Rule = {
        bd: null,
        id: 'internal.config',
        name: '脚本配置页面',
        subModule: false,
        includeSubHost: false,
        host: ['localhost.cuwcl4c', 'jixunmoe.github.io'],
        path: ['/conf/', '/cuwcl4c/config'],
        onStart: function () {
            unsafeWindow.rScriptVersion = Constants_2.version;
            unsafeWindow.rScriptConfig = JSON.stringify(ScriptConfig_3.Config);
            var _c = confirm;
            document.addEventListener('SaveConfig', function (e) {
                try {
                    var config = JSON.stringify(JSON.parse(e.detail));
                }
                catch (e) {
                    alert('解析设定值出错!');
                    return;
                }
                if (_c("\u786E\u5B9A\u50A8\u5B58\u8BBE\u5B9A\u81F3 " + Script_4.Script.Name + "?"))
                    GM_setValue(Script_4.Script.Name, config);
            });
        },
        onBody: function () {
            Rule.bd = new BatchDownload_1.BatchDownload();
            Rule.bd.CaptureAria();
        }
    };
    exports.Rules = [Rule];
});
define("Rules", ["require", "exports", "SiteRule", "site/AA.Config"], function (require, exports, SiteRule_1, AA_Config) {
    "use strict";
    AA_Config.Rules.forEach(SiteRule_1.Add);
});
define("EntryPoint", ["require", "exports", "helper/Script", "helper/Constants", "helper/ScriptConfig", "helper/QueryString", "helper/Logger", "SiteRule"], function (require, exports, Script_5, Constants_3, ScriptConfig_4, QueryString_1, Logger_2, SiteRule_2) {
    "use strict";
    var $_GET = QueryString_1.Parse(Constants_3.currentUrl);
    if (ScriptConfig_4.Config.bUseCustomRules) {
        var customRules = [];
        try {
            customRules = eval("[" + ScriptConfig_4.Config.sCustomRule + "]");
            customRules.forEach(function (rule) {
                SiteRule_2.Sites.push(rule);
            });
        }
        catch (ex) {
            Logger_2.error("\u89E3\u6790\u81EA\u5B9A\u4E49\u89C4\u5219\u53D1\u751F\u9519\u8BEF: " + ex.message);
        }
    }
    GM_registerMenuCommand("\u914D\u7F6E " + Script_5.Script.Name, function () {
        GM_openInTab(Script_5.Script.Config, false);
    });
    SiteRule_2.FireEvent('start');
    $(function () {
        SiteRule_2.FireEvent('body');
    });
});
