import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { BeginWith, Contains, EndWith } from "../helper/Extension";
import * as jPlayer from "../hooker/jPlayer";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: IDownloadRule = {
	id: 'music.56',
	ssl: false,

	name: '56 音乐网',
	host: 'www.23356.com',
    path: ['/plus/player.ashx', '/ting/', '/music/'],
	includeSubHost: false,
    subModule: false,

    hide: '.player-bottom-gg, .nocopyright',

    bd: null,
	onStart: () => {
        rule.bd = new Downloader();
	},

    onBody: () => {
        jPlayer.Patch((media: I56Media) => {
            var addr = media.mp3 || media.m4a;
			$('.play-info-otheropt > a:last')
				.attr('href', rule.bd.GenerateUri (addr, media.songname + addr.slice(-4)))
                .attr('title', `下载: ${media.songname} (歌手: ${media.singername})`)
				.find('span').text(`下载 (${Script.Name})`);
        });

        var need_play: boolean = false;
        unsafeWindow.splayer.song_data[0].forEach((song) => {
            if (song.delflag || song.delflag != 0) {
                need_play = true;
                song.delflag = 0;
                if (BeginWith(song.url, '/del')) {
                    song.url = song.url.replace('/del', '');
                }
            }
        });

        if (need_play) {
            unsafeWindow.$('#play').click();
        }
    }
};

export var Rules: ISiteRule[] = [rule];

interface I56Media extends jPlayer.jPlayerMedia {
	rid: string;
	songname: string;
	singername: string;
	singerphoto: string;
	singrurl: string;
	lrc: string;
	m4a: string;
}

declare var window: I56Window;
declare var unsafeWindow: I56Window;

interface I56Window extends Window {
    splayer: SPlayer;
    $: JQueryStatic;
}

interface SPlayer {
    song_data: ISong[][];
}
interface ISong {
    id: string;
    songname: string;
    singerid: string;
    singername: string;
    singerphoto: string;
    url: string;
    lrc: string;
    wordurl: string;
    playurl: string;
    singerurl: string;
    delflag: string|number;
}