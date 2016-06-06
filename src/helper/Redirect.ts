import { WaitUntil } from "./Wait";
import { BeginWith } from "./Extension";
import { info } from "./Logger";

import { } from "../typings/jquery/jquery.d";

/**
 * 跳转后保留当前页面作为 referrer.
 */
export function RedirectTo(url:string): void
{
    info(`准备跳转 ${url}...`);

    var link = $('<a>')
        .attr('href', url)
        .text(`正在跳转 [${url}], 请稍后.. `)
        .prependTo(document.body)
        .css ({fontSize: 12, color: 'inherit'});
    
    link[0].click();
}

/**
 * phpDisk 通用跳转文件下载页面函数
 * 
 * 返回 true 代表成功
 * 否则代表找不到规则。
 */
export function phpdiskAutoRedirect(callback:PhpDiskRedirectCallback): boolean
{
    if (!callback) {
        callback = document.body ? RedirectTo : (url) => {
            WaitUntil('document.body', ()=>{
                RedirectTo(url);
            });
        };
    }
    
    var rCheckPath = /\/(file)?(file|view)([\/.\-_].*)/;
    if (rCheckPath.test (location.pathname)) {
        callback (location.pathname.replace (rCheckPath, '/$1down$3'));
    } else if (BeginWith(location.pathname, '/viewfile')) {
        callback (location.pathname.replace('/viewfile', '/download'));
    } else { return false; }

    return true;
}

interface PhpDiskRedirectCallback {
    (url: string): void
}