import {  } from "./Userscript.d";

export declare class Aria {
    constructor (options: AriaOptions);
    public send(): GmXhrReturn;
    public addUri(
        uris: string[],
        options: AriaXhrOptions,
        onSuccess: AriaSuccessCallback,
        onFail: AriaFailCallback
    ): GmXhrReturn;
    
    public addUri(
        uris: string[],
        options: AriaXhrOptions,
        onSuccess: AriaSuccessCallback
    ): GmXhrReturn;
    
    public addUri(
        uris: string[],
        options: AriaXhrOptions
    ): GmXhrReturn;
}

export interface AriaOptions {
    auth: {
        type: AriaAuthType,
        user: string;
        pass: string;
    },
    host: string;
    port: number;
}

export interface AriaXhrOptions {
    out: string,
    referer?: string,
    dir: string,
    'user-agent': string,
    header?: string[]
}

export interface AriaSuccessCallback {
    (r: AriaCallbackArgument|any): void
}

export interface AriaFailCallback {
    (mustFalse: boolean, r: AriaCallbackArgument|any): void
}

export interface AriaCallbackArgument{ 
    
}

export enum AriaAuthType {
    NoAuth = 0,
    HttpBasicAuth = 1,
    SecretAuth = 2,
}