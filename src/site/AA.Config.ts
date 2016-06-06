import { version } from "../helper/Constants";
import { Config } from "../helper/ScriptConfig";
import { Script } from "../helper/Script";
import { BatchDownload } from "../helper/BatchDownload";
import { SiteRule } from "../SiteRule";

import { } from "../typings/Userscript.d";

var Rule: IConfigPageRule = {
    bd: null,
    id: 'internal.config',
    name: '脚本配置页面',
    subModule: false,
    includeSubHost: false,
    
    host: ['localhost.cuwcl4c', 'jixunmoe.github.io'],
    path: ['/conf/', '/cuwcl4c/config'],
    
    onStart: () => {
        (<any>unsafeWindow).rScriptVersion = version;
        (<any>unsafeWindow).rScriptConfig  = JSON.stringify(Config);
        
		var _c = confirm;
		document.addEventListener ('SaveConfig', function (e: CustomEvent) {
			try {
				var config = JSON.stringify (JSON.parse (e.detail));
			} catch (e) {
				alert ('解析设定值出错!');
                return;
			}
            
            if (_c (`确定储存设定至 ${Script.Name}?`))
                GM_setValue (Script.Name, config);
		});
    },
    
    onBody: () => {
        Rule.bd = new BatchDownload();
        Rule.bd.CaptureAria();
    }
}


interface IConfigPageRule extends SiteRule {
    bd: BatchDownload;
}

export var Rules: SiteRule[] = [Rule];