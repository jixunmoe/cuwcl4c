import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { RedirectTo } from "../helper/Redirect";
import { ISiteRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/jquery/jquery.d";

var rule: ISiteRule = {
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
        (unsafeWindow as any).killpanads = 1;
	},

    onBody: () => {
        // 文件第一页
        var url = $('.caocuo .jubao').next().find('a').attr('href');
        if (url) {
            RedirectTo(url);
        } else if (Contains(location.pathname, '/downpanel.asp')) {
            // 第三页 - 最终下载地址展示
            url = $("div > a[href*='/down.asp']").attr('href');
            RedirectTo(url);
        } else {
            // 第二页: 填写验证码
            $('#download > a').click();
        }
    }
};

export var Rules: ISiteRule[] = [rule];