import { BeginWith, Contains, EndWith } from "../helper/Extension";
import { WaitUntil } from "../helper/Wait";
import { ISiteRule } from "../SiteRule";
import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: ISiteRule = {
	id: 'dl.namipan',
	name: '纳米盘.cc [原 87盘 应该]',
	host: 'namipan.cc',
    path: ['/file/', '/down.php'],
	includeSubHost: true,
    subModule: false,

    hide: '#box',
    css: `
body, body > .ggao {
    height: initial;
}
    `,

	onStart: () => {
	},

    onBody: () => {
        // 下载按钮: #downgo
        var m = location.pathname.match(/\d+/);
        var dlBtn = $('#downgo');
        if (dlBtn.length > 0 && m) {
            var frame = $('<iframe>');
            var note = $('<p>');

            note.text('注意: 需要登录才能下载。').css('color', 'red');

            frame.attr({
                src: `/down.php?file_id=${m[0]}`,
            }).css({
                display: 'table',
                border: 0,
                borderBottom: '1px solid #ccc',
                width: '100%',
                height: 70
            });
            
            dlBtn.before(frame);
            frame.after(note);
        }
    }
};

export var Rules: ISiteRule[] = [rule];