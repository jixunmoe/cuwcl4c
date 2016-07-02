import { info, error } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { BeginWith, Contains, EndWith, GetExtensionFromUrl } from "../helper/Extension";
import * as jPlayer from "../hooker/jPlayer";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: IEchoRule = {
	id: 'music.echo',
	ssl: false,

	name: 'Echo 回声音乐',
	host: 'www.app-echo.com',
    path: '/sound/',
	includeSubHost: false,
    subModule: false,

    hide: '',

    bd: null,
    dlLink: null,

	onStart () {
        rule.bd = new Downloader();
	},

    onBody () {
        if (BeginWith (location.pathname, '/sound/')) {
            rule.SinglePage();
        }
    },

    SinglePage () {
        // 单曲页面
        // http://www.app-echo.com/sound/info-mobile?sound_id=${id}
        var id = location.pathname.match(/\d+/);
        if (!id) {
            error('获取曲目 ID 失败!');
            return ;
        }

        // 插入下载连接x
        var smallText = $('<small>');
        var urlDl = $('<a>');

        $('.single-title > h1').append(smallText);
        smallText.append(urlDl);
        rule.dlLink = urlDl;

        urlDl.text('下载')
            .attr('title', '正在解析...')
            .css('margin-left', '1em');

        var frame = document.createElement('iframe');
        frame.src = 'about:blank';
        document.body.appendChild(frame);

        unsafeWindow.onerror = null;

        var req: xhrParams = {
            method: 'GET',
            url: `/sound/info-mobile?sound_id=${id}`,
            onload: (response: GmXhrResponse) => {
                var target = $(response.responseText)
                    .filter('script')
                    .filter((i, el) => Contains(el.textContent, 'play_source('));

                if (target.length === 0) {
                    error('搜索不到有效的曲目代码。');
                    return ;
                }
                
                // 导出我们的函数
                var wnd = frame.contentWindow as MobileFrameWindow;
                exportFunction((id: string, type: string, url: string, unk: any) => {
                    WaitUntil('page_sound_obj', () => rule.UpdateUrl(url, unsafeWindow.page_sound_obj.name));
                }, wnd, {
                    defineAs: 'play_source'
                });

                // 执行捕捉到的元素
                var s = wnd.document.createElement('script');
                s.textContent = target.text();
                wnd.document.body.appendChild(s);
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36'
            }
        };

        GM_xmlhttpRequest(req);
    },

    UpdateUrl(url: string, name: string) {
        let s = Contains(url, '?') ? '&' : '?';
        let _url = `${url}${s}attname=${encodeURIComponent(name)}${GetExtensionFromUrl(url)}`;

        rule.dlLink
            .attr('href', rule.bd.GenerateUri(url, name + GetExtensionFromUrl(url)))
            .attr('title', `下载: ${name}`);

        // info(`捕捉到下载地址: ${url}`);
    }
};

export var Rules: ISiteRule[] = [rule];

interface IEchoRule extends IDownloadRule {
    SinglePage: () => void;
    UpdateUrl: (url: string, name: string) => void;
    dlLink: JQuery;
}

declare var window: EchoWindow;
declare var unsafeWindow: EchoWindow;

interface EchoWindow extends Window {
    page_sound_obj: ISoundObj;
}

interface MobileFrameWindow extends Window {
    play_source: (id: string, type: string, url: string, unk: any) => void
}

interface ISoundObj {
	name: string;
	length: string;
	"view_count": string;
	channel: IChannel;
	pic: string;
	"pic_100": string;
	id: string;
	user: IUser;
	"create_time": string;
	"is_like": number;
	"share_count": string;
	"channel_id": string;
	"like_count": string;
	"comment_count": string;
	info: string;
	source: string;
}

interface IUser {
	id: string;
	name: string;
	avatar: string;
	photo: string;
	"pay_class": string;
	"pay_status": string;
	"famous_status": string;
	"followed_count": string;
	status: string;
	"famous_type": string;
	"famous_icon": string;
	"avatar_150": string;
	"avatar_100": string;
	"avatar_50": string;
	"is_follow": number;
}


interface IChannel {
	id: number;
	name: string;
	pic: string;
	info: string;
	type: number;
	"tag_id": number;
	"sound_count": number;
	"follow_count": number;
	"like_count": number;
	"share_count": number;
	"user_id": number;
	"update_user_id": number;
	"list_order": number;
	"create_time": number;
	"update_time": number;
	status: number;
	desp: string;
	"pic_100": string;
	"pic_200": string;
	"pic_500": string;
	"pic_640": string;
	"pic_750": string;
	"pic_1080": string;
}