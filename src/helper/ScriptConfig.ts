import { Script } from "./Script";

import { } from "../typings/UserScript.d"
import { } from "../../typings/jquery/jquery.d";
import { } from "../typings/GM_Aria2RPC.d";

export enum UriType {
    NormalUrl = 0,
    
    /** @deprecated use others instead. */
    Custom = 1,
    
    Aria = 2,
}

export var Config: IScriptConfig;

Config = $.extend({
    bDiaplayLog: true,
    bInternational: false,
    bUseCustomRules: false,
    bUseThridOnFail: false,
    
    dAria_auth: Aria2.AUTH.noAuth,
    dAria_port: 6800,
    dUriType: UriType.NormalUrl,
    
    sAria_dir: "D:\\Download\\",
    sAria_host: "127.0.0.1",
    sAria_pass: "",
    sAria_user: "",
    
    sCustomRule: ""
}, ReadConfig ()) as IScriptConfig;

function ReadConfig (): IScriptConfig
{
    try {
        return JSON.parse(GM_getValue(Script.Name, "") as string) as IScriptConfig;
    } catch (ex) {
        return {} as IScriptConfig;
    }
}

export interface IScriptConfig {
    bDiaplayLog: boolean;
    bInternational: boolean;
    bUseCustomRules: boolean;
    bUseThridOnFail: boolean;
    
    dAria_auth: number;
    dAria_port: number;
    dUriType: UriType;
    
    sAria_dir: string;
    sAria_host: string;
    sAria_pass: string;
    sAria_user: string;
    
    sCustomRule: string;
}
