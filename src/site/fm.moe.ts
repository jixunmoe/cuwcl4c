import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { BeginWith, Contains, EndWith } from "../helper/Extension";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: IDownloadRule = {
	id: 'fm.moe',
	ssl: false,

	name: '萌否电台',
	host: 'moe.fm',
	includeSubHost: false,
    subModule: false,

    css: `

a.jixun-dl {
    width: 26px !important;
    background-position: -19px -96px !important;
    transform: rotate(90deg);
}

    `,

    bd: null,
	onStart: () => {
        rule.bd = new Downloader();
        rule.bd.CaptureAria();
	},

    onBody: () => {
        (unsafeWindow as any).is_login = true;

        var dlLink = $('<a>');
        dlLink
            .addClass('player-button left jixun-dl')
            .insertAfter('div.player-button.button-volume');
        
        Script.ListenEvent<MoeFmClip>((clip) => {
            dlLink
                .attr('href', rule.bd.GenerateUri(clip.url, `${clip.sub_title}.mp3`))
                .attr('title', `下载: ${clip.sub_title}`);
        });

        unsafeExec((scriptName) => {
            function notifyUpdate (clip: MoeFmClip) {
                document.dispatchEvent ( new CustomEvent (scriptName, {detail: JSON.stringify(clip) }) );
            }

            define('plugin/jixun', function(require, exports) {
                console.info('[CUWCL4C] 开始注入 ...');
                var listen = require('/public/js/fm/page/listen.js');
                var player = require('player/player');

                var _initPlayer = player.initPlayer;
                player.initPlayer = function (clip: MoeFmClip) {
                    notifyUpdate(clip);
                    _initPlayer.apply(this, arguments);
                };
                console.info('[CUWCL4C] 注入结束 ...');
            });
            
            // 要求载入外挂模组
            seajs.use('plugin/jixun');
        }, Script.Name);
    }
};

export var Rules: ISiteRule[] = [rule];

interface MoeFmClip {
    up_id: number;
    url: string;
    stream_length: string;
    stream_time: string;
    file_size: number;
    file_type: string;
    wiki_id: number;
    wiki_type: string;
    cover: MoeFmClipCover;
    title: string;
    wiki_title: string;
    wiki_url: string;
    sub_id: number;
    sub_type: string;
    sub_title: string;
    sub_url: string;
    artist: string;
    share_buttons: string;
}

interface MoeFmClipCover {
    small: string;
    medium: string;
    square: string;
    large: string;
}

declare function define(module: string, callback: SeaJSDefineCallback): void;
interface SeaJSDefineCallback {
    (require: any, exports: any): void;
}
declare interface seajsStatic {
    use(module: string): void;
}
declare var seajs: seajsStatic;