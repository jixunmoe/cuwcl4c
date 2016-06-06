import { Script } from "./helper/Script";
import { currentUrl } from "./helper/Constants";
import { Config } from "./helper/ScriptConfig";
import { Parse } from "./helper/QueryString";
import { error } from "./helper/Logger";


import { Sites, SiteRule, FireEvent } from "./SiteRule";

var $_GET = Parse(currentUrl);

import {} from "./Rules";

if (Config.bUseCustomRules) {
    var customRules: SiteRule[] = [];
    try {
        customRules = <SiteRule[]>eval(`[${Config.sCustomRule}]`);
        
        customRules.forEach((rule) => {
            Sites.push(rule);
        });
    } catch (ex) {
        error(`解析自定义规则发生错误: ${ex.message}`);
    }
}

GM_registerMenuCommand (`配置 ${Script.Name}`, () => {
    GM_openInTab(Script.Config, false);
});

FireEvent('start');

$(() => {
    FireEvent('body');
});
