import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { RedirectTo, phpdiskAutoRedirect } from "../helper/Redirect";
import { Script } from "../helper/Script";
import { ISiteRule, Execute } from "../SiteRule";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/Userscript.d";
/// <reference path="../typings/globals/jquery/index.d.ts" />

var phpdiskA: ISiteRule = {
	id: 'phpdisk.a',
	name: 'PHPDisk A 类网赚网盘',
	host: [
		/* 网站全死了 */
	],

	hide: '#code_box, #down_box2, #codefrm, .ad, [class^="banner"]',
	show: '#down_box',

	includeSubHost: true,
	subModule: false,

	onStart: () => {
		let f = () => {};

		unsafeDefineFunction ('open', f);
	},

	onBody: () => {
		var self = this;
		WaitUntil('down_file_link', () => {
			var ctx: any = unsafeWindow;
			// 避免地址被覆盖
			ctx.update_sec = null;
			// 强制显示地址
			ctx.down_file_link ();

			// 强制显示下载地址
			if (ctx.show_down_url)
				ctx.show_down_url('down_a1');

			var jumpUrl = $('#down_link').find('a').attr('href');

			// 然后跳过去
			if (jumpUrl) {
				RedirectTo (jumpUrl);
			} else {
				alert (`[${Script.Name}]: 应用 ${self.name} 失败:\n找不到跳转地址.`);
			}
		});
	}
};

var phpdiskZ: ISiteRule = {
	id: 'phpdisk.z',
	name: '通用 phpDisk.z 网盘规则',
	// 规则: 直接跳转 /file-xxx -> /down-xxx
	//       并隐藏 down_box2, 显示 down_box

	host: [
		'10pan.cc', '66yp.cc', '123wzwp.com', 'hiyp.cc'
	],

	hide: `.Downpagebox, .talk_show, .banner_2, .w_305, .ad,
		   #vcode, #tui, .dcode, #down_box2, #dl_tips, .nal,
		   .scbar_hot_td, #incode`,

	show: '#down_box, #dl_addr',

	includeSubHost: true,
	subModule: false,

	onStart: () => {
		let f = () => {};

		unsafeDefineFunction ('alert', f);
		unsafeDefineFunction ('down_process', f);
		phpdiskAutoRedirect(null);
	},

	onBody: () => {
		/* fix for 123wzwp.com */
		let f = () => {};

		unsafeDefineFunction ('down_process2', f);
		$(document.body).on('click', 'a', e => {
			var $dl = $(e.currentTarget);
			let url = $dl.data('url');
			if (url.length > $dl.attr('href').length) {
				$dl.attr('href', url);
			}
		});
	}
};

var jkpanRule: ISiteRule = {
	id: 'jkpan.phpdisk',
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
				}, 500);
			});
		} else if (BeginWith(location.pathname, '/file-')) {
			RedirectTo (location.pathname.replace('file', 'down2'));
		}
	}
}

export var Rules: ISiteRule[] = [phpdiskA, phpdiskZ, jkpanRule];