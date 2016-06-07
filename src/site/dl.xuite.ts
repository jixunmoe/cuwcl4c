import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { RedirectTo } from "../helper/Redirect";
import { ISiteRule } from "../SiteRule";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/Userscript.d";
import { } from "../typings/jquery/jquery.d";

var rule: ISiteRule = {
	id: 'dl.hami-cloud',
	name: 'Hami+ 個人雲',
	host: ['webhd.xuite.net', 'sync.hamicloud.net'],
    path: '/_oops/',
	includeSubHost: false,
    subModule: false,

	onStart: () => {
	},

    onBody: () => {
        $('#share-download-func-submit').click();
		unsafeExec (function () {
			$(function () {
				$('#global').data('time', 9);
			});
		});
    }
};

export var Rules: ISiteRule[] = [rule];