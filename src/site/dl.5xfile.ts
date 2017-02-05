import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { RedirectTo } from "../helper/Redirect";
import { ISiteRule } from "../SiteRule";

import { } from "../typings/Userscript.d";

var rule: ISiteRule = {
	id: 'dl.5xfile',
	name: '五星网盘',
	host: ['5xfile.com', 'www.5xfile.com'],
	includeSubHost: false,
    subModule: false,

	onStart: () => {
        // TODO: 启动事件
	},

    onBody: () => {
        // TODO: 页面事件
    }
};

export var Rules: ISiteRule[] = [rule];