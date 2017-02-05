import { info } from "../helper/Logger";
import { Script } from "../helper/Script";
import { Base64Decode } from "../helper/Crypto";
import { Downloader } from "../helper/Downloader";
import { GetFlashVars } from "../helper/QueryString";

/// <reference path="../typings/globals/jquery/index.d.ts" />

var bd: Downloader;

function init () {
    if (!bd) bd = new Downloader();
}

export function Hook() {
    info("WordPress Audio 插件通用代码 启动");

    new MutationObserver (function (eve) {
        var target:HTMLElement;
        var record: MutationRecord;
        for (var i=0; i<eve.length; i++) {
            record = eve[i];
            target = record.target as HTMLElement;
            
            if (target.classList.contains('audioplayer_container')
                && record.addedNodes.length > 0) {
                    AddLinkToEmbed(eve[i].addedNodes[0] as HTMLElement);
            }
        }
    }).observe ($('.post > .entry')[0], {
        childList: true,
        subtree: true
    });
    
    // 检查已经插入在页面的播放器, 火狐需要的样子.
    $('object[id^="audioplayer_"]').each(() => {
        AddLinkToEmbed(this);
    });

    info("WordPress Audio 插件通用代码 结束");
}

function AddLinkToEmbed(obj:HTMLElement) {
    if (obj.tagName != 'OBJECT' || obj.hasAttribute(Script.Name))
        return ;
    
    var songParams: WordPressAudioParam = GetFlashVars(obj as HTMLObjectElement);
    var songAddress = Base64Decode(songParams.soundFile);
    var songTitle   = songParams.titles;
    var songExt     = songAddress.slice(-4);
    $('<a>')
        .text(`下载「${songTitle}」`)
        .css('display', 'block')
        .attr('href', bd.GenerateUri(songAddress, `${songTitle}${songAddress}`))
        .attr('target', '_blank');
    
    obj.setAttribute(Script.Name, Script.Name);
}

interface WordPressAudioParam {
    soundFile: string;
    titles: string;
}