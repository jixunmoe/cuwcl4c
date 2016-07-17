import { info, error } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { Config, UriType } from "../helper/ScriptConfig";
import { BeginWith, Contains, EndWith, GetExtensionFromUrl } from "../helper/Extension";

import { ISiteRule, IDownloadRule } from "../SiteRule";

import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/globals/vue/index.d";


const KugouDownloadFront = 'https://jixunmoe.github.io/cuwcl4c/kugou-dl';

var app: any = null;

var rule: IKugouRule = {
	id: 'music.kugou',
	ssl: false,

	name: '酷狗音乐',
	host: 'web.kugou.com',
	includeSubHost: false,
    subModule: false,
    hide: '#adv, .jx-hide',

    css: `
.dialog-shadow {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	background: rgba(0,0,0,.3);
	z-index: 100;
}

.dialog-container {
	min-width: calc(768px + 2em);
	min-height: 20em;
	padding: 1em;
	background: #fff;
	box-shadow: 2px 2px 2px #666;
	border: 1px solid rgba(6,6,6,.3);
	position: relative;
	padding-top: 2.5em;
}

.dialog-title-bar {
	position: absolute;
	left: 0;
	top: 0;
	padding: .4em;
	width: calc(100% - .8em);
	border-bottom: 1px solid white;
	background: #00A7F2;
	color: white;
}

.dialog-title-btns {
	float: right;
}

.dialog-title-btns > .dialog-bar-btn {
	width: 1em;
	height: 1em;
	border: 1px solid white;
	text-align: center;
	line-height: 1.2;
	padding: 0 .5em;
	margin-left: .5em;
	cursor: pointer;
}

.dialog-content iframe {
	height: 30em;
	width: 100%;
}
`,

    bd: null,
	onStart () {
        rule.bd = new Downloader();
	},

    onBody () {
		// 火狐狸有兼容问题, 待修
		if (!Contains(navigator.userAgent, 'Firefox'))
        	rule.BuildDialog();
    },

    BuildDialog () {
        let downloader = $(
`<div id="jixun-dl">
	<div class="dialog-shadow" v-bind:class="{ 'jx-hide': hideWindow }">
		<div class="dialog-container">
			<div class="dialog-title-bar">
				下载窗口

				<div class="dialog-title-btns">
					<span class="dialog-bar-btn" v-on:click="toggleFrame">管</span>
					<span class="dialog-bar-btn" v-on:click="hide">关</span>
				</div>
			</div>

			<div class="dialog-content">
				<div v-bind:class="{ 'jx-hide': hideMsg }">{{ msg }}</div>
				<iframe v-el:frame-dl-dialog v-bind:class="{ 'jx-hide': mode != 1 }" src="${KugouDownloadFront}"></iframe>
				<iframe v-el:frame-dl-manager v-bind:class="{ 'jx-hide': mode != 2 }"  src="${KugouDownloadFront}/dl.html"></iframe>
			</div>
		</div>
	</div>
</div>`);
		downloader.appendTo(document.body);

		// Require VueJS from resource.
		let vueLoader = new Function('window', GM_getResourceText('VueJs') + '\n; return window.Vue;');
		let Vue = vueLoader(unsafeWindow) as any;

		app = new Vue({
			el: downloader[0],

			data: {
				msg: '正在获取相关数据...',
				hideMsg: false,
				mode: 0,
				hideWindow: false
			},

			methods: {
				init () {
					app.hideWindow = true;
				},

				toggleFrame () {
					if (app.mode == 1) {
						app.mode = 2;
					} else {
						app.mode = 1;
					}
				},

				hide () {
					app.hideWindow = !app.hideWindow;
				}
			}
		});

		app.init();

		var actionDlDialog  = ['set', 'clear'];
		var actionDlManager = ['add'];
		function post (action: string, data?: any) {
			var frame = actionDlDialog.indexOf(action) != -1 ? app.$els.frameDlDialog : app.$els.frameDlManager;
			var msg = {
				action: action,
				data: data
			};

			frame.contentWindow.postMessage(JSON.stringify(msg), '*');
		}

		// 获取音质信息
		function handleDownload (songs: string) {
			post('clear');
			app.hideMsg = false;
			app.mode = 0; // hideThem
			app.hideWindow = false;

			var resource = JSON.parse(songs).map((song: KugouSong) => ({
				type: 'audio',
				id: 0,
				hash: song.Hash
			}));

			var payload = {
				"userid": 0,
				"token": "",
				"vip": 1,
				"behavior": "download",
				"relate": 1,
				"resource": resource,
				"appid": 1001,
				"clientver": "8031",
				"source": {
					"module": "1",
					"type": "0",
					"id": 0
				}
			};

			GM_xmlhttpRequest({
				method: "POST",
				url: "http://media.store.kugou.com/v1/get_res_privilege",
				data: JSON.stringify(payload),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					post('set', JSON.parse(response.responseText));
					app.hideMsg = true;
					app.mode = 1; // 展现下载管理界面
				},
				onerror: function () {
					alert('接口获取失败, 请稍后重试!');
					app.hideWindow = true;
				}
			});
		}

		var looper = new IntervalLoop([], proc_hash, 500);
		looper.loop();
		window.addEventListener("message", onMessage, false);
		function onMessage (e: MessageEvent) {
			var data = JSON.parse(e.data);
			if (data.action == 'cancel') {
				app.hideWindow = true;
			} else if (data.action == 'download') {
				app.mode = 2;
				looper.add.apply(looper, data.data);
			} else {
				error('Undefined action: ' + data.action);
			}
		}

		function handle_dl (song: any) {
			var file = song.fileName + '.' + song.extName;
			var url = song.url;

			post('add', song);
			if (Config.dUriType == UriType.Aria) {
				rule.bd.AddDownload(url, file);
			}
		}

		function proc_hash (next: any, hash: any) {
			hash = hash.toLowerCase();
			var key = CryptoJS.MD5(hash + 'kgcloud').toString();
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'http://trackercdn.kugou.com/i/?cmd=4&hash=' + hash + '&key=' + key + '&pid=1&forceDown=0&vip=1',
				onload: function (response) {
					var song = JSON.parse(response.responseText);
					handle_dl(song);
					next();
				},
				onerror: function () {
					error('Error while fetching data for %s', hash);
					next();
				}
			});
		}

		/* 导出函数 */
		exportFunction(handleDownload, unsafeWindow, {
			defineAs: "dl_jixun"
		});

		unsafeExec(function () {
			window.downLoad = function () {
				try {
					window.dl_jixun.apply(this, arguments);
				} catch (err) {
					console.error(err);
				}
			};
		});
    }
};

declare var window: KugouWindow;
declare var IntervalLoop: any;
interface KugouWindow extends Window {
	downLoad: any;
	dl_jixun: any;
}

export var Rules: ISiteRule[] = [rule];

interface IKugouRule extends IDownloadRule {
    BuildDialog: () => void;
}

interface KugouSong {
	TimeLength: number;
	krcId: number;
	FileOrderWeight: number;
	HasMV: number;
	FileId: number;
	musiclib: string;
	MVHash: string;
	Hash: string;
	extendName: string;
	MVTracks: number;
	FileName: string;
	songURL: string;
	MVType: number;
	FileSize: number;
	singerPic: string;
	BitRate: number;
	collection: boolean;
}