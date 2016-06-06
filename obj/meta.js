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
// @version        4.0.581

// 尝试使用脚本生成匹配规则
// ////               [Include Rules]

// @include http://localhost.cuwcl4c/*
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
