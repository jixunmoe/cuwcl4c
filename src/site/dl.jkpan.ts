import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { RedirectTo, phpdiskAutoRedirect } from "../helper/Redirect";
import { Script } from "../helper/Script";
import { ISiteRule, Execute } from "../SiteRule";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/Userscript.d";
/// <reference path="../typings/globals/jquery/index.d.ts" />

// 魔改 phpdisk
var jkpanRule: ISiteRule = {
	id: 'dl.phpdisk.jkpan',
	name: 'JKPAN 规则 [phpDisk]',
	host: ['jkpan.cc'],
	includeSubHost: true,
	subModule: false,
	onStart: () => {
		var ctx: any = unsafeWindow;
		ctx.killads = 1;
		
		var s = document.createElement('script');
		s.id = 'adblockTester';
		document.head.appendChild(s);
	},
	
	onBody: () => {
		var ctx: any = unsafeWindow;
		var s = document.createElement('div');
		s.id = 'b1';
		s.style.cssText = 'height:500px;position:fixed;left:-500px';
		document.body.appendChild(s);
		
		if (BeginWith(location.pathname, '/down2-')) {
			let handler:any = ctx.handlerPopup;
			ctx.handlerPopup = unsafeDefineFunction ('handlerPopup', function (captchaObj:any) {
				handler.apply(this, arguments);
				setTimeout(function () {
					captchaObj.show();
				}, 750);
			});
		} else if (BeginWith(location.pathname, '/file-')) {
			RedirectTo (location.pathname.replace('file', 'down2'));
		}
	}
}

export var Rules: ISiteRule[] = [jkpanRule];