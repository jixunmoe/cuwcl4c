// ==UserScript==
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_getValue
// @grant          GM_setValue

// @run-at         document-start
// @name:en        Bypass Wait, Code & Login on Websites
// @name           跳过网站等待、验证码及登录
// @name:zh-TW     繞過站點等待、識別碼及登錄

// @description       移除各类网站验证码、登录、倒计时及更多!
// @description:zh-TW 移除各類站點識別碼、登錄、倒計時及更多!
// @description:en    Remove verify code, login requirement, counting down... and more!


// @copyright      2014+, Yulei, Mod by Jixun.
////               Based on [Crack Url Wait Code Login] By Yulei

/// 骑牛 CDN
// @require        http://cdn.staticfile.org/jquery/2.1.1-beta1/jquery.min.js
// @require        http://cdn.staticfile.org/crypto-js/3.1.2/components/core-min.js
// @require        http://cdn.staticfile.org/crypto-js/3.1.2/components/enc-base64-min.js

/// 兼容 GM 1.x, 2.x
// @require        https://greasyfork.org/scripts/2599/code/gm2_port_v104.js

// @author         jixun66
// @namespace      http://jixun.org/
// @version        3.0.<% #build.js %>

//// 网盘域名匹配
///  国内一些「网赚」网盘，体验很差 orz

// @include *
// @exclude http://pos.baidu.com/*
// ==/UserScript==
