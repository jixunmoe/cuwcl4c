import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { BeginWith, Contains, EndWith } from "../helper/Extension";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";

var rule: IDownloadRule = {
	id: 'fm.douban',
	ssl: true,

	name: '豆瓣电台下载解析',
	host: 'douban.fm',
	includeSubHost: false,
    subModule: false,

    css: `
a#jx_douban_dl {
	background: #9DD6C5;
	padding: 3px 5px;
	color: #fff
}

a#jx_douban_dl:hover {
	margin-left: 5px;
	padding-left: 10px;
	background: #BAE2D6;
}

div#jx_douban_dl_wrap {
	float: right;
	margin-top: -230px;
	margin-right: -32px;
	font-weight: bold;
	font-family: 'Microsoft JHengHei UI', '微软雅黑', serif-sans;
}
    `,

    bd: null,
	onStart: () => {
        rule.bd = new Downloader();
        rule.bd.CaptureAria();
	},

    onBody: () => {
		var linkDownload = $('<a>');

        linkDownload.css('transition', 'all .2s')
			.attr ('target', '_blank')
			.attr ('id', 'jx_douban_dl')
			.text ('下载');

		$('<div>')
			.attr ('id', 'jx_douban_dl_wrap')
			.append(linkDownload)
			.insertAfter('.player-wrap');
		
		info('等待豆瓣电台加载 ..');
		WaitUntil('extStatusHandler', function () {
			info('绑定豆瓣电台函数 ..');
			unsafeOverwriteFunctionSafeProxy ({
				extStatusHandler: function (jsonSongObj: string) {
					var event: DoubanFmEvent = <DoubanFmEvent>JSON.parse(jsonSongObj);
					if ('start' == event.type) {
						var song = (<DoubanFmSongEvent>event).song;
                        var file = song.title + song.url.slice(-4);
						linkDownload
							.attr('href', rule.bd.GenerateUri (song.url, file))
							.attr('title', `下载: ${song.title}`);
						
						info (`${song.title} => ${song.url}`);
					}

					throw new ErrorUnsafeSuccess ();
				}
			});

			info('函数绑定完毕, Enjoy~');
		});
    }
};

export var Rules: ISiteRule[] = [rule];

interface DoubanFmEvent {
	type: string;
}

interface DoubanFmSongEvent extends DoubanFmEvent {
	song: DoubanFmSingleSong,
	channel: string;
}

interface DoubanFmSingleSong {
	album_id: string;
	album: string;
	pubtime: string;
	extrainfo: string;
	ssid: string;
	subtype: string;
	picture: string;
	songlists_count: string;
	monitor_url: string;
	len: string;
	url: string;
	adtype: string;
	albumtitle: string;
	like: string;
	sid: string;
	kbps: string;
	artist: string;
	title: string;
}