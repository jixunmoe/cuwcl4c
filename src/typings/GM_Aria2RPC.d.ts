/// <reference path="Userscript.d.ts" />

interface AuthOptions {
    noAuth: number;
    basic:  number;
    secret: number;
}

interface AriaOptions {
    auth: {
        type: number,
        user: string;
        pass: string;
    },
    host: string;
    port: number;
}

interface AriaXhrOptions {
    out: string,
    referer?: string,
    dir: string,
    'user-agent': string,
    header?: string[]
}

interface AriaSuccessCallback {
    (r: AriaCallbackArgument|any): void
}

interface AriaFailCallback {
    (mustFalse: boolean, r: AriaCallbackArgument|any): void
}

interface AriaCallbackArgument{ 
    
}


declare class Aria2 {
    constructor (options: AriaOptions);
    static AUTH: AuthOptions;
    send(): GmXhrReturn;

    addUri(
        uris: string[],
        options: AriaXhrOptions,
        onSuccess: AriaSuccessCallback,
        onFail: AriaFailCallback
    ): GmXhrReturn;
    
    addUri(
        uris: string[],
        options: AriaXhrOptions,
        onSuccess: AriaSuccessCallback
    ): GmXhrReturn;
    
    addUri(
        uris: string[],
        options: AriaXhrOptions
    ): GmXhrReturn;
}
