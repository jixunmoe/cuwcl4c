import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { RedirectTo, phpdiskAutoRedirect } from "../helper/Redirect";
import { ISiteRule } from "../SiteRule";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/Userscript.d";
/// <reference path="../typings/globals/jquery/index.d.ts" />

var rule: ISiteRule = {
	id: 'dl.yimuhe',
	name: '一木禾',
	host: 'www.yimuhe.com',

	hide: '#loading, .ggao, .kuan',
	show: '#yzm',

	includeSubHost: false,
    subModule: false,
    runInFrame: true,

	onStart: () => {
		phpdiskAutoRedirect(null);
	},

    onBody: () => {
		if (BeginWith ( location.pathname, '/n_dd.php' )) {
			RedirectTo($('#downs').attr('href'));
			return ;
		}

		var dlContainer = document.getElementById ('download');
		if (!dlContainer) return ;

		// 当下载框的 style 属性被更改后, 模拟下载按钮单击.
		var mo = new MutationObserver (function () {
			$('a', dlContainer)[1].click();
		});
		mo.observe (dlContainer, { attributes: true });
    }
};

export var Rules: ISiteRule[] = [rule];