import { Script } from "./Script";
import { EnableLogs, info } from "./Logger";

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

function ReadConfig (): IScriptConfig
{
    try {
        return JSON.parse(GM_getValue(Script.Name, "") as string) as IScriptConfig;
    } catch (ex) {
        return { version: 0 } as IScriptConfig;
    }
}

Config = $.extend({
    version: 1,
    bDiaplayLog: true,
    bYellowEaseInternational: false,
    bYellowEaseUseOldApi: false,
    bYellowEaseUseThridOnFail: false,
    bUseCustomRules: false,
    
    dAria_auth: Aria2.AUTH.noAuth,
    dAria_port: 6800,
    dUriType: UriType.NormalUrl,
    
    sAria_dir: "D:\\Download\\",
    sAria_host: "127.0.0.1",
    sAria_pass: "",
    sAria_user: "",
    
    sCustomRule: ""
} as IScriptConfig, ReadConfig ()) as IScriptConfig;

// 升级
const __latest_version = 1;
if (Config.version != __latest_version) {
    switch (Config.version) {
        case undefined:
        case 0:
            info('升级 v0 配置文件...');
            Config.version = 1;

            Config.bYellowEaseInternational = (<IScriptConfigV0>Config).bInternational;
            Config.bYellowEaseUseOldApi = (<IScriptConfigV0>Config).bProxyInstalled;
            Config.bYellowEaseUseThridOnFail = (<IScriptConfigV0>Config).bUseThridOnFail;

            delete (<IScriptConfigV0>Config).bInternational;
            delete (<IScriptConfigV0>Config).bUseThridOnFail;
            delete (<IScriptConfigV0>Config).bProxyInstalled;
            break;
        
        case 1:
            break;
    }

    GM_setValue (Script.Name, JSON.stringify(Config));
}

if (Config.bDiaplayLog)
    EnableLogs();

export interface IScriptConfigV0 extends IScriptConfig {
    bInternational: boolean;
    bProxyInstalled: boolean;
    bUseThridOnFail: boolean;
}

export interface IScriptConfig {
    bDiaplayLog: boolean;
    bUseCustomRules: boolean;
    bYellowEaseInternational: boolean;
    bYellowEaseUseOldApi: boolean;
    bYellowEaseUseThridOnFail: boolean;
    
    dAria_auth: number;
    dAria_port: number;
    dUriType: UriType;
    
    sAria_dir: string;
    sAria_host: string;
    sAria_pass: string;
    sAria_user: string;
    
    sCustomRule: string;

    version: number;
}
