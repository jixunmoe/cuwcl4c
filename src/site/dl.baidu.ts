import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { ISiteRule } from "../SiteRule";
import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: ISiteRule = {
	id: 'dl.baidu',
	name: '百度盘免下载管家',
	host: ['yun.baidu.com', 'pan.baidu.com'],
	includeSubHost: false,
    subModule: false,

	onStart: () => {
	},

    onBody: () => {
        WaitUntil ('require', function () {
			unsafeExec (function () {
                var require = (<any>window).require;
				var service = require('file-widget-1:download/util/downloadCommonUtil.js');
				service.isPlatformWindows = function () { return false; };
			});
		});

    }
};

export var Rules: ISiteRule[] = [rule];
