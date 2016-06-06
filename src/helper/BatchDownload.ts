import { Script } from "./Script";
import { Config, UriType, IScriptConfig } from "./ScriptConfig";
import { BeginWith } from "./Extension";

import { } from "../typings/Userscript.d";
import { Aria, AriaOptions, AriaXhrOptions } from "../typings/GM_Aria2RPC";
import { } from "../typings/jquery/jquery.d";

var config = Config as IScriptConfig;

export class BatchDownload {
    private _captured: boolean = false;
    
    BatchDownload () {
        
    }
    
    private GenerateUrlPart(url: string, filename: string, ref?: string): string
    {
        return `${url}|${this.GetReferrerUrl(filename)}|${this.GetReferrerUrl(ref)}`;
    }
    
    private GetReferrerUrl (url: string): string
    {
        return String(url || location.href).replace(/#.*/, '');
    }
    
    private NormaliseFilename (filename: string): string
    {
        return String(filename).replace(/['"\/\\:|]/g, '_');
    }
    
    public GenerateUri (url: string, filename: string, ref?: string): string
    {
        switch (config.dUriType) {
            case UriType.Custom:
				return `cuwcl4c://|1|${this.GenerateUrlPart(url, filename, ref)}`;
               
            case UriType.Aria:
                if (!this._captured)
                    this.CaptureAria();
                
				return `aria2://|${this.GenerateUrlPart(url, filename, ref)}`;
        }
        
        return url;
    }
    
    public CaptureAria(el?: Element|JQuery|string): void
    {
        this._captured = true;
        this.SetupAria(false);
        
        if (!el) el = document.body;
        $(el).click((e) => {
            var el : Element = e.target;
            var $el = $(el);
            
            var linkEl:HTMLAnchorElement = (
                $el.is('a') ? el : $el.parents('a')[0]
            ) as HTMLAnchorElement;
            
			if (linkEl && linkEl.tagName == 'A' && BeginWith(linkEl.href, 'aria2://|')) {
				e.stopPropagation ();
				e.preventDefault  ();

				var link: string[] = linkEl.href.split('|');
				this.AddToAria(
                    link[1], decodeURIComponent(link[2]),
                    link[3], linkEl.classList.contains('aria-cookie')
                );
			}
        });
    }
    
    public AddToAria(
        url: string,
        filename: string,
        referer?: string,
        cookie?: boolean|string,
        headers?: string[]): void
    {
		var ariaParam: AriaXhrOptions = {
			out: filename,
			referer: referer || location.href,
			dir: config.sAria_dir,
			'user-agent': navigator.userAgent,
			header: headers || []
		};
        
		if (cookie === true)
			cookie = document.cookie;

		if (cookie)
			ariaParam.header.push ('Cookie: ' + cookie);

		this.aria.addUri ([url], ariaParam, (r)=>{}, (b, r) => {
			var sErrorMsg: string;
			if (r.error) {
				sErrorMsg = `错误代码 ${r.error.code}: ${r.error.message}`;
			} else {
				sErrorMsg = "与 Aria2 后台通信失败, 服务未开启?";
			}

			alert (`[${Script.Name}] 提交任务发生错误!

${sErrorMsg}`);
		});
    } 
    
    aria: Aria;
    private SetupAria(forceSetup: boolean): void
    {
        if (forceSetup || !this.aria) {
            this.aria = new Aria({
				auth: {
					type: config.dAria_auth,
					user: config.sAria_user,
					pass: config.sAria_pass
				},
				host: config.sAria_host,
				port: config.dAria_port
            });
        }
    }
    
    public AddDownload(url: string, file: string): void
    {
        if (config.dUriType == UriType.Aria) {
            this.AddToAria(url, file);
        } else {
            GM_openInTab(this.GenerateUri(url, file), true);
        }
    }
}
