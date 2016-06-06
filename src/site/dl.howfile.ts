import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { RedirectTo } from "../helper/Redirect";
import { SiteRule } from "../SiteRule";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/Userscript.d";
import { } from "../typings/jquery/jquery.d";

var rule: SiteRule = {
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

export var Rules: SiteRule[] = [rule];