import { } from "../typings/Userscript.d";

// 常数
export var isFrame = _isFrame();
export var version = GM_info.script.version;
export var currentUrl = location.href.split ('#')[0];
export var lowerHost = location.hostname.toLowerCase();
export var topHost = lowerHost.match(/\w+\.?\w+?$/)[0];
export var topHostMask = `.${topHost}`;

export var downloadIconClass    =  'jx_dl';
export var downloadIconSelector = '.jx_dl';

function _isFrame(): boolean
{
    try {
        return unsafeWindow.top !== unsafeWindow.self;
    } catch (e) {
        return true;
    }
}
