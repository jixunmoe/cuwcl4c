import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";

import { } from "../typings/GM_Unsafe.d";
/// <reference path="../typings/globals/jquery/index.d.ts" />


export function Patch(callback:jPlayerMediaCallback, namespace: string = "jPlayer") {
    info('等待 jPlayer 就绪 ..');
    
    WaitUntil(`$.${namespace}.prototype.setMedia`, () => {
        info ('开始绑定函数 ..');
        unsafeOverwriteFunctionSafeProxy({
            setMedia: (newMedia: jPlayerMedia) => {
                info ('歌曲数据: ', newMedia);
                callback (newMedia);
                throw new ErrorUnsafeSuccess();
            }
        }, (unsafeWindow.$ as any)[namespace].prototype, `.$.${namespace}.prototype`);
    });
}

declare var unsafeWindow: jPlayerWindow;

interface jPlayerWindow extends Window {
    $: JQueryStatic;
}

interface jPlayerMediaCallback {
    (media: jPlayerMedia): void
}

export interface jPlayerMedia {
    mp3: string;
    m4a: string;
    m4v: string;
    webma: string;
    webmv: string;
    oga: string;
    ogv: string;
    fla: string;
    flv: string;
    wav: string;
    poster: string;
    title: string;
    duration: string;
    track: Track[];
}

interface Track {
    kind: string;
    src: string;
    srclang: string;
    label: string;
    def: string;
}