import { info } from "../helper/Logger";
import { WaitUntil } from "../helper/Wait";

import { } from "../typings/GM_Unsafe.d";
import { } from "../typings/jquery/jquery.d";


export function Patch(callback:jPlayerMediaCallback, namespace: string = "jPlayer") {
    info('等待 jPlayer 就绪 ..');
    
    WaitUntil(`$.${namespace}.prototype.setMedia`, () => {
        info ('开始绑定函数 ..');
        unsafeOverwriteFunctionSafeProxy({
            setMedia: (newMedia: Media) => {
                info ('歌曲数据: ', newMedia);
                callback (newMedia);
                throw new ErrorUnsafeSuccess();
            }
        }, unsafeWindow['$'][namespace].prototype, `.$.${namespace}.prototype`);
    });
}

interface jPlayerMediaCallback {
    (media: Media): void
}

interface Media {
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