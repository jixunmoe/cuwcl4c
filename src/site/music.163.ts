import { warn, info, error } from "../helper/Logger";
import { isFrame, downloadIconClass, version } from "../helper/Constants";
import { WaitUntil } from "../helper/Wait";
import { Downloader } from "../helper/Downloader";
import { Script } from "../helper/Script";
import { Config, UriType } from "../helper/ScriptConfig";
import * as qs from "../helper/QueryString";
import { BeginWith, Contains, EndWith, Shuffle } from "../helper/Extension";

import { ISiteRule } from "../SiteRule";
import { } from "../typings/Userscript.d";
import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/globals/cryptojs/index.d";

const __MP3_BLANK = 'https://jixunmoe.github.io/cuwcl4c/blank.mp3';

var rule: IYellowEaseRule = {
    id: 'music.163',
    ssl: false,

    name: '黄易云音乐',
    host: 'music.163.com',
    includeSubHost: false,
    subModule: false,
    runInFrame: true,
    dl_icon: true,

    css: `

.m-pbar, .m-pbar .barbg {
    width: calc( 455px - 2.5em );
}

.m-playbar .play {
    width: calc( 570px - 2.5em );
}

.m-playbar .oper {
    width: initial;
}

.jx_dl:hover {
    color: white;
}

/* 底部单曲下载 */
.m-playbar .oper .jx_btn {
    text-indent: 0;
    font-size: 1.5em;
    margin: 13px 2px 0 0;
    float: left;
    color: #ccc;
    text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em #aaa;
    line-height: 1.6em;
    font-size: 1.2em;
}

.m-playbar .oper .jx_dl::before {
    padding-right: .25em;
}

.jx_btn:hover {
    color: white;
}

/* 播放列表下载 */
.m-playbar .listhdc .jx_dl.addall {
    left: 306px;
    line-height: 1em;
    /* 多一个 px, 对齐文字 */
    top: 13px;
}

.m-playbar .listhdc .line.jx_dl_line {
    left: 385px;
}

    `,

    instance: null,
    onStart: () => {
        rule.instance = new YellowEase();
    },

    onBody: () => {
        rule.instance.BodyEvent();
    }
};

export var Rules: ISiteRule[] = [rule];

interface IYellowEaseRule extends ISiteRule {
    instance: YellowEase
}

class YellowEase {
    _localProxy: boolean;
    _btnDownload: JQuery;
    _downloader: Downloader;
    _cdn: string;
    _cdns: string[];

    constructor() {
        if (localStorage.__HIDE_BANNER) {
            rule.style.Hide('#index-banner');
        }

        if (Config.bYellowEaseInternational)
            this._cdns = GenerateCdnList();

        this._downloader = new Downloader();

        unsafeExec(() => {
            var fakePlatForm = navigator.platform + "--Fake-mac";
            Object.defineProperty(navigator, "platform", {
                get: () => { return fakePlatForm; },
                set: () => { }
            });
        });
    }

    public BodyEvent () {
        WaitUntil('nm.x', () => {
            // 两个版权提示, 一个权限提示.
            var fnBypassCr1 = this.Search(unsafeWindow.nej.e, 'nej.e', '.dataset;if');
            var fnBypassCr2 = this.Search(unsafeWindow.nm.x, 'nm.x',  '.copyrightId==');
            var fnBypassCr3 = this.Search(unsafeWindow.nm.x, 'nm.x',  '.privilege;if');

            unsafeExec((fnBypassCr1: string, fnBypassCr2: string, fnBypassCr3: string) => {
                var _fnBypassCr1 = window.nej.e[fnBypassCr1];
                window.nej.e[fnBypassCr1] = function (z: any, name: string) {
                    if (name == 'copyright' || name == 'resCopyright') {
                        return 1;
                    }

                    return _fnBypassCr1.apply(this, arguments);
                };

                window.nm.x[fnBypassCr2]= () => {
                    return false;
                };

                window.nm.x[fnBypassCr3]= (song: CrStatus) => {
                    song.status = 0;

                    if (song.privilege) {
                        song.privilege.pl = 320000;
                    }
                    
                    return 0;
                };
            }, fnBypassCr1, fnBypassCr2, fnBypassCr3);
        });

        if (isFrame) {
            this.FramePage();
        } else {
            this.PlayerPage();
        }
    }

    public Search(base: Object, displayBase: string, keyword: string|RegExp, suppressLog: boolean = false): string
    {
        for(let itemName in base) {
            if (base.hasOwnProperty(itemName)) {
                let fn = (<any>base)[itemName];
                if (fn && typeof fn == 'function') {
                    let fnStr = String(fn);
                    if (TestString(fnStr, keyword)) {
                        if (!suppressLog)
                            info(`定位查找 %c${keyword}%c 成功: %c${displayBase}.${itemName}`, 'color: darkviolet', 'reset', 'color: green');
                        return itemName;
                    }
                }
            }
        }

        if (!suppressLog)
            error(`定位查找子函数 ${keyword} 于 ${displayBase} 失败, 请联系作者修复!`);
        return null;
    }

    private SearchSubPrototype(base: Object, displayBase: string, keyword: string|RegExp, suppressLog: boolean = false): string[]
    {
        for(let itemName in base) {
            if (base.hasOwnProperty(itemName)) {
                let newBase: Function = (<any>base)[itemName];
                // 检查现在的这个是不是子类
                if (newBase && newBase.prototype) {
                    // info(`查找 %c${displayBase}.${itemName}.prototype%c ...`, 'color:lightgray', 'reset');
                    let r = this.Search(newBase.prototype, displayBase, keyword, true);
                    if (r != null) {
                        if (!suppressLog)
                            info(`定位查找 %c${keyword}%c 成功: %c${displayBase}.${itemName}::${r}`,
                                'color: darkviolet', 'reset', 'color: green');
                        return [itemName, 'prototype', r];
                    }
                }
            }
        }
        
        if (!suppressLog)
            error(`定位查找子类函数 ${keyword} 于 ${displayBase} 失败, 请联系作者修复!`);
        
        return null;
    }

    _btnDownloadAll: JQuery;
    private PlayerPage()
    {
        this._btnDownload = $('<a>');
        this._btnDownload
            .attr('title', '播放音乐，即刻解析。')
            .click((e) => e.stopPropagation())
            .addClass(downloadIconClass)
            .addClass('jx_btn')
            .appendTo('.m-playbar .oper');
        
        // TODO: 加入歌单下载按钮
        this._btnDownloadAll = $('<a>');
        this._btnDownloadAll
            .addClass('addall')
            .text('全部下载')
            .addClass(downloadIconClass)
            .click( () => this.DownloadAll () );

        if (Config.dUriType == UriType.Aria) {
            this._downloader.CaptureAria(this._btnDownload);
        } else {
            // TODO: 隐藏歌单下载按钮
        }

        if (location.pathname == '/demo/fm') {
            this.HookRadioPlayer();
        } else {
            this.HookNormalPlayer();
        }


    }

    private DownloadAll(): void
    {
        // TODO: 下载所有曲目
    }

    _btnChangeCdn: JQuery;
    _ajaxBackup: YellowEaseAjax;
    private HookNormalPlayer()
    {
        WaitUntil(() => {
            return document.querySelector('.listhdc > .addall') != null;
        }, () => {
            var dlLine = $('<a>');
            dlLine
                .addClass('line jx_dl_line')
                .hide();

            this._btnDownloadAll
                .insertBefore('.m-playbar .listhdc .addall')
                .after(dlLine)
                .hide();
        }, true, 500);

        function nextSong () {
            (document.querySelector('.nxt') as HTMLAnchorElement).click();
        }

        WaitUntil('nej.j', () => {
            var fnAjax = this.Search(unsafeWindow.nej.j, "nej.j", '.replace("api","weapi');
            var fnGetSongRaw = this.SearchSubPrototype(
                unsafeWindow.nm.w,
                'nm.w',
                /return this\.\w+\[this\.\w+\]/
            );
            var clsPlayer = fnGetSongRaw[0];
            var fnGetSong = fnGetSongRaw[2];

            if (Config.bYellowEaseInternational) {
                this._btnChangeCdn = $('<a>');
                this._btnChangeCdn
                    .addClass('jx_btn jx_cdn')
                    .click(() => this.NextCdn())
                    .insertAfter(this._btnDownload)
                    .text('换');

                var cdn = GM_getValue('_ws_cdn_media', null);
                if (!cdn) {
                    this.NextCdn();
                } else {
                    this._cdn = cdn as string;
                }
            }

            ////// 安装修改后的 取得曲目信息 函数开始

            var callEventFn = GenerateValidName();

            exportFunction((song: string) => {
                var data = JSON.parse(song) as ISongInfoCache;
                this._song = {
                    artists: data.artists.map((artist) => artist.name).join('、'),
                    name: data.name,
                    url: null
                };
                info(`捕捉到音乐切换: ${this._song.name}`);
            }, unsafeWindow, {
                defineAs: callEventFn
            });

            unsafeExec((callEventFn: string, clsPlayer: string, fnGetSong: string) => {
                var _getSongBackup: Function = window.nm.w[clsPlayer].prototype[fnGetSong];
                window.nm.w[clsPlayer].prototype[fnGetSong] = function () {
                    var r = _getSongBackup.call(this);
                    if (r !== undefined) {
                        window[callEventFn](JSON.stringify(r));
                    }
                    return r;
                }
            }, callEventFn, clsPlayer, fnGetSong);

            ////// 安装修改后的 取得曲目信息 函数结束


            ////// 安装修改后的 Ajax 函数开始

            var ajaxPatchFn = GenerateValidName();
            this._ajaxBackup = unsafeWindow.nej.j[fnAjax];

            if (Config.bYellowEaseUseOldApi || Config.bYellowEaseInternational) {
                let hookedAjax = (Config.bYellowEaseUseOldApi ? this.AjaxPatchedOldApi : this.AjaxPatchedInternational);
                
                exportFunction(hookedAjax.bind(this), unsafeWindow, {
                    defineAs: ajaxPatchFn
                });

                unsafeExec((ajaxPatchFn: string, fnAjax: string) => {
                    var ajaxPatched  = (<any>window)[ajaxPatchFn] as YellowEaseAjax;
                    var ajaxOriginal = window.nej.j[fnAjax] as YellowEaseAjax;
                    window.nej.j[fnAjax] = CustomAjax as YellowEaseAjax;

                    function CustomAjax(url: string, params: IXhrParam): void
                    {
                        // console.info(`url: ${url}`);
                        if (url.indexOf('log/') != -1) {
                            setTimeout(() => {
                                params.onload({
                                    code: 200
                                });
                            }, 100);
                            return ;
                        }

                        if (!params.headers)
                            params.headers = {};

                        var _onload = params.onload;
                        // params._onload = params.onload;
                        params.onload = (data) => {
                            params.onload = _onload;
                            if (params._onload) {
                                params._onload(data, _onload);
                            } else {
                                params.onload(data);
                            }
                        };

                        ajaxPatched(url, params);
                    }
                }, ajaxPatchFn, fnAjax);
            }

            ////// 安装修改后的 Ajax 函数结束

            /// 挂钩下一首切换事件, 强制重新读取当前曲目地址。
            var fnNextSong = this.Search(unsafeWindow.nm.w[clsPlayer].prototype, `nm.w.${clsPlayer}.prototype`, '(+1),"ui")');
            unsafeExec((clsPlayer: string, fnNextSong: string) => {
                var oldNextSong: Function = window.nm.w[clsPlayer].prototype[fnNextSong];
                var reloadSong: Function = eval('(' + oldNextSong.toString().replace('1', '0')+')');
                window.nm.w[clsPlayer].prototype[fnNextSong] = function () {
                    window.nm.w[clsPlayer].prototype[fnNextSong] = oldNextSong;
                    return reloadSong.call(this);
                };
                (document.querySelector('.nxt') as HTMLAnchorElement).click();
            }, clsPlayer, fnNextSong);

        });
    }

    private AjaxPatchedOldApi(url: string, params: IXhrParam): void
    {
        if (url != '/api/song/enhance/player/url') {
            this._ajaxBackup(url, params);
            return ;
        }

        url = '/api/v3/song/detail';
        let query = params.query as ISongUrlQuery;
        if (query.br) delete query.br;

        var _ids = JSON.parse(query.ids);
        var requestIds: string[] = [];

        this.LoadCache();
        var songs: ISongInfo[] = _ids.map((id: string) => {
            if (id in this._songCache) {
                return this._songCache[id];
            }

            requestIds.push(id);

            return null;
        }).filter((song: ISongInfo) => {
            return song;
        });

        if (requestIds.length === 0) {
            info(`从缓存读取曲目信息。`);
            let reply = SongsToUrlReply(songs);
            this.NotifyUrlChange(reply.data[0].url);
            params.onload(reply);
            return ;
        }

        info('请求服务器获取信息: %o', requestIds);
        params.query = {
            ids: requestIds 
        };

        params._onload = <IXhrOnloadCustom>exportFunction((data: IXhrSongDetailReply, _onload: IXhrOnload) => {
            this.LoadCache(false);

            data.songs.forEach((song) => {
                this._songCache[song.id] = song;
            });
            this.SaveCache();

            let reply = SongsToUrlReply(_ids.map((id: string) => this._songCache[id]));
            this.NotifyUrlChange(reply.data[0].url);
            _onload(reply);
        }, unsafeWindow);

        this._ajaxBackup(url, params);
    }

    _songCache: TrackCache;
    _reloadCache: boolean = true;
    private LoadCache(force: boolean = false) {
        if (force || this._reloadCache) {
            try {
                this._songCache = JSON.parse(localStorage.__track_queue_cache) as TrackCache;
            } catch (err) {
                this._songCache = {};
                localStorage.__track_queue_cache = '{}';
            }
        }

        this._reloadCache = false;
    }

    private SaveCache (): void
    {
        localStorage.__track_queue_cache = JSON.stringify(this._songCache);
    }

    _song: SongChangeEvent;
    private AjaxPatchedInternational(url: string, params: IXhrSongUrlParam, try_br?: number): void
    {
        if (url != '/api/song/enhance/player/url') {
            this._ajaxBackup(url, params);
            return ;
        }

        params.headers['X-Real-IP'] = '118.88.88.88';

        var id = JSON.parse(params.query.ids)[0];
        params._onload = <IXhrOnloadCustom>exportFunction((data: IXhrSongUrlReply, _onload: IXhrOnload) => {
            if (data.data[0].url) {
                let url = this.InjectCdn(data.data[0].url);
                _onload(UrlToSongUrlReply(id, url));
                this.NotifyUrlChange(url);
            } else if (Config.bYellowEaseUseThridOnFail && !try_br) {
                MusicSpy.Get(id, (err, url) => {
                    if (err) {
                        error(err);
                        return ;
                    }
                    let cdn_url = this.InjectCdn(url);
                    _onload(UrlToSongUrlReply(id, cdn_url));
                    this.NotifyUrlChange(cdn_url);
                });
            };
        }, unsafeWindow);

        this._ajaxBackup(url, params);
    }

    private NotifyUrlChange(url: string): void
    {
        this._song.url = url;
        this.OnSongChange();
    }

    private OnSongChange(): void
    {
        this._btnDownload.attr({
            href: this._downloader.GenerateUri(this._song.url, `${this._song.name} [${this._song.artists}].mp3`),
            title: `下载: ${this._song.name}`
        });
    }

    private InjectCdn(url: string): string
    {
        var r = url.replace(/(m10\.music\.126\.net)/, `${this._cdn}/$1`);
        info(`播放音乐 (${r})`);
        return r;
    }

    private NextCdn()
    {
        if (!this._cdns)
            this._cdns = GenerateCdnList();
        
        var ip = this._cdns.shift();
        this._cdns.push(ip);
        this.NotifyCdn(ip);
    }

    private NotifyCdn(ip: string)
    {
        if (this._btnChangeCdn)
            this._btnChangeCdn.attr('title', `更换 CDN [当前: ${ip}]`);
        
        info(`使用 CDN: ${ip}`);

        this._cdn = ip;
        localStorage.ws_cdn_media = ip;
        GM_setValue("_ws_cdn_media", ip);

        document.dispatchEvent(new CustomEvent(Script.Name + '-cdn', {
            detail: ip
        }));
    }

    private HookRadioPlayer()
    {
        
    }

    private FramePage()
    {
        switch(location.pathname.split('/')[1]) {
            case 'mv':              // MV
                this.MoviePage();
                break;

            case 'outchain':        // 外链
                this.OutchainPage();
                break;

            case 'song':            // 单曲
                this.SinglePage();
                break;

            case 'album':           // 专辑
            case 'artist':          // 艺术家
            case 'playlist':        // 播放列表
            case 'discover':        // 首页
                this.EnableItems();
                break;
        }
    }

    private MoviePage () {
        var $flashBox = $('#flash_box');
        if ($flashBox.length > 0) {
            var html = $flashBox.html();
            var params: MvFlashParams = <MvFlashParams>
                qs.Parse(html.match(/flashvars="([\s\S]+?)"/)[1].replace(/&amp;/g, '&'));

            var qualities: IStringDictionary = {
                hurl: '高清',
                murl: '标清',
                lurl: '渣画质'
            };

            var $dlHolder = $('<p>').css({
                textAlign: 'right'
            }).text('MV 下载: ').insertAfter($flashBox);

            Object.keys(qualities).forEach((qualityId) => {
                if (params[qualityId]) {
                    var $dl = $('<a>').attr({
                        
                        href: this._downloader.GenerateUri(params[qualityId],
                                `${params.trackName}[${qualities[qualityId]}].mp4`),
                        
                        title: `下载 ${params.trackName} 的 ${qualities[qualityId]} Mv`

                    }).prop('download', true).text(qualities[qualityId]);

                    // 修正 163 自己的跳转.
                    this._downloader.CaptureAria($dl);
                    $dlHolder.append($dl);
                    $dlHolder.append(' | ');
                }
            });
            $dlHolder.append(`提供: ${Script.Name} ${version}`);

            if (Config.bYellowEaseInternational) {
                $flashBox.html(html.replace(/restrict=true/g, 'restrict='));

                // 自动关闭弹出的提示框
                var timer = setInterval(function () {
                    var el = document.getElementsByClassName('zcls');
                    if (el.length > 0) {
                        el[0].dispatchEvent(new Event('mousedown'));
                        clearInterval(timer);
                    }
                }, 100);
            }
        }

    }

    private OutchainPage () {
        // TODO: 外链页面
    }

    private SinglePage () {
        var timer = window.setInterval(() => {
            var playButton = document.getElementsByClassName('u-btni-addply');
            if (playButton.length == 1) {
                window.clearInterval(timer);
                return;
            }

            // Otherwise it should be a disabled button.
            var playButtons = document.getElementsByClassName('u-btni-play-dis');
            if (playButtons.length == 1) {
                window.clearInterval(timer);
                var songId = $('#content-operation').data('rid');

                (<HTMLAnchorElement>playButtons[0]).outerHTML = `
<a data-res-action="play" data-res-id="${songId}" data-res-type="18" href="javascript:;"
  class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true" title="播放">
    <i><em class="ply"></em>播放</i>
</a>

<a data-res-action="addto" data-res-id="${songId}" data-res-type="18" href="javascript:;"
  class="u-btni u-btni-add" hidefocus="true" title="添加到播放列表">
</a>
                `;
            }

        }, 1000);
    }

    private EnableItems () {
        var timer = window.setInterval(() => {
            var disbledItems = document.getElementsByClassName('js-dis');

            if (disbledItems.length === 0){
                window.clearInterval(timer);
            }

            for (var i = 0; i < disbledItems.length; ){
                disbledItems[i].classList.remove('js-dis');
            }
        }, 1000);
    }
}

function TestString(src:string, needle: string|RegExp)
{
    if (typeof needle == 'string') {
        return Contains(src, needle);
    } else {
        return (needle as RegExp).test(src);
    }
}

function GenerateCdnList(): string[]
{
    var cdns: string[] = [
        // 电信
        "125.90.206.32", 
        "222.186.132.103", 
        "117.23.6.89", 
        "119.145.207.17", 
        "180.97.180.71", 
        "116.55.236.93", 
        "218.76.105.42", 
        "125.64.232.15", 
        "115.231.87.37", 
        "58.221.78.68", 
        "220.112.195.148", 
        "218.64.94.67", 
        "36.42.32.76", 
        "61.136.211.16", 
        "218.64.94.68", 
        "219.138.21.71", 
        "49.79.232.58", 
        "122.228.24.30", 
        "182.106.194.85", 
        "218.59.186.98", 
        "61.158.133.21", 
        "117.27.241.20", 
        "58.51.150.133", 
        "218.29.49.132", 
        "60.215.125.76", 
        "183.61.22.17", 
        "183.134.14.26", 
        "58.220.6.142", 
        "115.231.158.44", 
        "61.164.241.105", 
        "125.46.22.124", 
        "222.28.152.139", 
        "124.165.216.244", 
        "218.60.106.115", 
        "202.107.85.81", 
        "61.179.107.116", 
        "175.43.20.69", 
        "220.194.203.86", 
        "61.160.209.27", 
        "120.209.141.79", 
        "120.209.142.138", 
        "219.138.21.72", 
        "58.216.21.132",
        '14.215.228.10',
        '218.87.111.83',

        // 北京电信
        '203.130.59.8',
        '203.130.59.10',
        '203.130.59.11',
        '203.130.59.12'
    ];

    return Shuffle<string>(cdns);
}

function GenerateValidName(): string
{
    return `${Script.Name}__${Date.now()}${Math.random()}`;
}

function GetEnhancedData(id: number, url: string): IEnhancedData
{
    return {
        id: id,
        url: url,

        br: 192000,
        size: 120000,
        md5: '00000000000000000000000000000000',
        code: 200,
        expi: 1200,
        type: 'mp3',
        gain: 0,
        fee: 0,
        uf: null,
        payed: 0,
        canExtend: false
    };
}

function SongsToUrlReply(songs: ISongInfo[]): IXhrSongUrlReply
{
    var reply: IXhrSongUrlReply = {
        code: 200,
        data: songs.map((song: ISongInfo) => {
            return GetEnhancedData(song.id, GenerateUrlFromSong(song));
        })
    };

    return cloneInto<typeof reply>(reply, unsafeWindow, {
        cloneFunctions: false,
        wrapReflectors: true
    });
}

function UrlToSongUrlReply(id: number, url: string): IXhrSongUrlReply
{
    var reply: IXhrSongUrlReply = {
        code: 200,
        data: [GetEnhancedData(id, url)]
    };

    return cloneInto<typeof reply>(reply, unsafeWindow, {
        cloneFunctions: false,
        wrapReflectors: true
    });
}

function GenerateUrlFromSong(song:ISongInfo) {
    var dfsId: number;
    var q: IQualityInfo = <IQualityInfo>(song.h || song.m || song.l || song.a);
    if (!q) {
        error(`歌曲 ${song.name} 已经下架，获取地址失败!`);
        return __MP3_BLANK;
    }

    dfsId = q.fid;
    var randServer = ~~(Math.random() * 2) + 1;

    var ipPrefix: string = '';
    if (Config.bYellowEaseInternational) {
        if (Config.bYellowEaseUseOldApi) {
            ipPrefix = '127.0.0.1:4003/';
        } else {
            // TODO: 这些 Ip 有用嘛?
            ipPrefix = rule.instance._cdn;
        }
    }

    var dfsHash = DoDfsHash(dfsId);
    return `http://${ipPrefix}m${randServer}.music.126.net/${dfsHash}/${dfsId}.mp3`;

}

function strToKeyCodes (str: any): number[]
{
    return String(str).split('').map((ch) => ch.charCodeAt(0));
}

const keys = [
    51, 103, 111, 56, 38, 36,
    56, 42, 51, 42, 51, 104,
    48, 107, 40, 50, 41, 50
];

function DoDfsHash(dfsid:number) {
    var fids = strToKeyCodes(dfsid).map(function(fid, i) {
        return (fid ^ keys[i % keys.length]) & 0xFF;
    });

    return CryptoJS.MD5((CryptoJS.lib as any).ByteArray(fids))
                .toString(CryptoJS.enc.Base64)
                .replace(/\//g, "_")
                .replace(/\+/g, "-");
}

module MusicSpy {
    var _ready: boolean = false;
    var _reloadCache: boolean = true;
    var _cache: MusicSpyCache = {};

    function Init(): void
    {
        _ready = true;
        Script.RegisterStorageEvent('_MUSIC_SPY', () => {
            _reloadCache = true;
        });

        ReloadCache();
    }

    function ReloadCache(force: boolean = false): void
    {
        if (force || _reloadCache) {
            try {
                _cache = JSON.parse(localStorage._MUSIC_SPY);
            } catch (ex) {
                _cache = {};
            }
        }

        _reloadCache = false;
    }

    function ReadCache (id: string|number): MusicSpyCacheItem
    {
        if (_reloadCache)
            ReloadCache();

        return _cache[id];
    }

    function SaveCache(): void
    {
        localStorage._MUSIC_SPY = JSON.stringify(_cache);
    }

    export function Get(id: string|number, callback: MusicSpyCallback): void
    {
        if (!_ready) Init();

        info(`第一步: 搜索曲目 (${id})`);

        var cacheSong = ReadCache(id);
        if (cacheSong) {
            info(`读自缓存, 请求解析真实地址。`);
            ParseRealAddress(cacheSong, callback);
            // callback(null, cacheSong.url);
            return ;
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: `http://itwusun.com/search/wy/${id}?p=1&f=json&sign=itwusun`,
            onload: (response) => {
                var data: MusicSpyItem[];
                try {
                    data = JSON.parse(response.responseText);
                } catch (err) {
                    callback(err);
                    return ;
                }

                if (data.length === 0) {
                    callback(new Error('无效的曲目搜索结果。'));
                    return ;
                }

                var song = data
                    .filter((song) => song.Type == 'wy' && song.SongId == id)
                    .pop();

                if (!song) {
                    callback(new Error('找不到曲目信息。'));
                    return ;
                }

                var url = song.SqUrl || song.HqUrl || song.LqUrl;
                var songObj: MusicSpyCacheItem = {
                    time: Date.now(),
                    url: url,

                    real_time: 0,
                    real_url: null
                };

                _cache[id] = songObj;
                SaveCache();

                info(`成功取得地址, 请求解析真实地址。`);
                ParseRealAddress(songObj, callback);
                // callback(null, url);
            },

            onerror: () => {
                callback(new Error('网络错误 (搜索曲目)'));
            }
        });
    }

    // 四小时后过期
    // 1000 * 60 * 60 *4 == 14400000
    function ParseRealAddress(cacheSong: MusicSpyCacheItem, callback: MusicSpyCallback) {
        info(`第二步: 解析真实地址 (${cacheSong.url})`);
        if (Date.now() - cacheSong.real_time < 14400000) {
            info (`读自缓存，结束读取。`);
            callback(null, cacheSong.real_url);
            return ;
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: cacheSong.url,
            headers: {
                Range: 'bytes=0-2'
            },
            onload: (response) => {
                cacheSong.real_url = response.finalUrl;
                cacheSong.real_time = Date.now();
                SaveCache();

                info (`解析结束: ${cacheSong.real_url}`);
                callback(null, response.finalUrl);
            },
            onerror: () => {
                callback(new Error('网络错误 (解析真实地址时)'), null);
            }
        });
    }


    interface MusicSpyCache {
        [key: string]: MusicSpyCacheItem;
    }

    interface MusicSpyCacheItem {
        time: number;
        url: string;

        real_time: number;
        real_url: string;
    }

    interface MusicSpyCallback {
        (error: Error, url?: string): void;
    }

    interface MusicSpyItem {
        SongId: string;
        SongName: string;
        SubTitle: string;
        Artist: string;
        ArtistSubTitle: string;
        AlbumId: string;
        Album: string;
        AlbumSubTitle: string;
        AlbumArtist: string;
        CollectName: string;
        Length: string;
        Size: string;
        BitRate: string;
        FlacUrl: string;
        AacUrl: string;
        SqUrl: string;
        HqUrl: string;
        LqUrl: string;
        ListenUrl: string;
        CopyUrl: string;
        PicUrl: string;
        LrcUrl: string;
        KlokLrc: string;
        MvId: string;
        MvUrl: string;
        VideoUrl: string;
        Language: string;
        Company: string;
        Year: string;
        Disc: string;
        TrackNum: string;
        Type: string;
    }
}

declare var localStorage: YellowEaseStorage;
declare var unsafeWindow: YellowEaseWindow;
declare var window: YellowEaseWindow;
interface YellowEaseStorage extends Storage {
    __HIDE_BANNER: string;
    __PLEASE_AUTO_SIGN: string;
    ws_cdn_media: string;
    __track_queue_cache: string;
    _MUSIC_SPY: string;
}

interface YellowEaseWindow extends Window {
    nej: any;
    nm:  any;
    [key: string]: any;
}

interface IStringDictionary {
    [key: string]: string;
}

interface SongChangeEvent {
    artists: string;
    name: string;
    url: string;
}

interface CdnChangeEvent { }

interface TrackCache {
    [key: string]: ISongInfo;
}

// 版权状态
interface CrStatus {
    privilege: IPrivilege;
    status: number;
    fee: number;
}

// Mv 参数
interface MvFlashParams extends IStringDictionary {
    trackName: string;

}

/**
 * 黄易的 Xhr 返回
 */
interface IXhrReply {
    code: number;
}

interface IXhrData {}

interface IXhrSongUrlReply extends IXhrReply {
    data: IEnhancedData[];
}

interface IEnhancedData extends IXhrData {
    id: number;
    url: string;
    br: number;
    size: number;
    md5: string;
    code: number;
    expi: number;
    type: string;
    gain: number;
    fee: number;
    uf: void /* 未知类型 */;
    payed: number;
    canExtend: boolean;
}

// url: /api/v3/song/detail
interface IXhrSongDetailReply extends IXhrReply {
    songs: ISongInfo[];
    privileges: IPrivilege[];
}

interface ISongInfo {
    id: number;
    name: string;
    
    rtUrls: void[];
    ar: IArtist[];
    al: IAlbum;
    st: number;
    a: void /* 未知类型 */;
    no: number;
    cd: string;
    fee: number;
    ftype: number;
    rtype: number;
    rurl: void /* 未知类型 */;
    t: number;
    v: number;
    crbt: void /* 未知类型 */;
    rtUrl: void /* 未知类型 */;
    pst: number;
    alia: void[];
    pop: number;
    rt: string;
    mst: number;
    cp: number;
    mv: number;
    cf: string;
    dt: number;
    l: IQualityInfo;
    m: IQualityInfo;
    h: IQualityInfo;
}


interface IQualityInfo {
    br: number;
    fid: number;
    size: number;
    vd: number;
}

/**
 * 黄易的 Xhr 参数构造
 */
interface IXhrParam {
    type: string;
    query: IQuery;
    headers?: IHttpHeader;
    onload: IXhrOnload;
    _onload: IXhrOnloadCustom;
    onerror: Function;
}

interface IXhrOnload {
    (data: IXhrReply): void
}

interface IXhrOnloadCustom extends IXhrOnload {
    (data: IXhrReply, _onload: IXhrOnload): void
}

interface IHttpHeader {
    "X-Real-IP"?: string;
}

interface IQuery { }

interface ISongUrlQuery extends IQuery {
    ids: string;
    br: number;
}

interface IXhrSongUrlParam extends IXhrParam {
    query: ISongUrlQuery;
}

/**
 * 黄易的 Ajax 函数
 */
interface YellowEaseAjax {
    (url: string, params: IXhrParam): void
}

/**
 * 黄易
 */
interface ISongInfoCache {
	album: IAlbum;
	alias: void[];
	artists: IArtist[];
	commentThreadId: string;
	copyrightId: number;
	duration: number;
	id: number;
	mvid: number;
	name: string;
	cd: string;
	position: number;
	ringtone: string;
	rtUrl: void /* 未知类型 */;
	status: number;
	pstatus: number;
	fee: number;
	version: number;
	songType: number;
	mst: number;
	score: number;
	ftype: number;
	rtUrls: void[];
	privilege: IPrivilege;
	source: void /* 未知类型 */;
}

interface IPrivilege {
	id: number;
	fee: number;
	payed: number;
	st: number;
	pl: number;
	dl: number;
	sp: number;
	cp: number;
	subp: number;
	cs: boolean;
	maxbr: number;
	fl: number;
	status: number;
}

interface IArtist {
	id: number;
	name: string;
}

interface IAlbum {
	id: number;
	name: string;
	picUrl: string;
	pic_str: string;
	pic: number;
	alia: string[];
}
