import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { BeginWith, Contains, EndWith } from "../helper/Extension";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: IYiTingRule = {
	id: 'music.1ting',
	ssl: false,

	name: '一听音乐',
	host: 'www.1ting.com',
	includeSubHost: false,
    subModule: false,

    css: ``,

    bd: null,
    _dl: null,
	onStart: () => {
        rule.bd = new Downloader();
	},

    onBody: () => {
        rule._dl = $('.songact > .down');
        rule._dl
            .removeAttr('onclick')
            .attr('target', '_blank');

        rule.bd.CaptureAria(rule._dl);

        WaitUntil('yiting.player.hook', () => {
            unsafeWindow.yiting.player.hook('play', exportFunction(() => {
                rule.UpdateSong();
            }, unsafeWindow));
            rule.UpdateSong();
        });
    },

    UpdateSong: () => {
        var name   = unsafeWindow.yiting.player.get('song-name');
        var singer = unsafeWindow.yiting.player.get('singer-name');
        var link   = unsafeWindow.yiting.player.host + unsafeWindow.yiting.player.get('song-media');

        rule._dl.attr({
            href: rule.bd.GenerateUri(link, `${name} [${singer}].mp3`),
            title: `点我下载: ${name}`
        });
    }
};

export var Rules: ISiteRule[] = [rule];
interface IYiTingRule extends IDownloadRule{
    _dl: JQuery;
    UpdateSong: () => void
}

declare var window: YiTingWindow;
declare var unsafeWindow: YiTingWindow;

interface YiTingWindow extends Window {
    yiting: IYiTing
    $: JQueryStatic;
    jQuery: JQueryStatic;
}

interface IYiTing {
    player: IYiTingPlayer
}

interface IYiTingPlayer {
    get: (name: string) => string;
    host: string;
    hook: (name: string, callback: Function) => void
}
