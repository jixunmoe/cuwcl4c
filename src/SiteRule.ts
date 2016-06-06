import { isFrame, lowerHost, topHostMask, downloadIconClass } from "./helper/Constants";
import { BeginWith, Contains, EndWith } from "./helper/Extension";
import { StyleSheet } from "./helper/StyleSheet";
import { info, error } from "./helper/Logger";

import { } from "../typings/jquery/jquery.d";

export var Sites: SiteRule[] = [];

export function Add(siteRule:SiteRule): void
{
    siteRule._styleApplied = false;
    Sites.push(siteRule);
}

export function CheckPath(
    path:string,
    rule:string|PathCheckCallback|RegExp|string[]|PathCheckCallback[]|RegExp[]): boolean
{
    if ($.isArray(rule)) {
        for(var i = (rule as any[]).length; i--; ) {
            if (CheckPath(path, (rule as any[])[i])) {
                return true;
            }
        }
        
        return false;
    }
    
    if ($.isFunction(rule)) {
        return (rule as any)(path);
    }
    
    if (typeof rule === 'string') {
        return BeginWith(path, rule);
    }
    
    if (rule instanceof RegExp) {
        return rule.test(path);
    }
    
    return false;
}

export function Check(site:SiteRule, event:string): boolean
{
    if (site.subModule) {
        return false;
    }
    
    if (typeof site.host == 'string') {
        site.host = [ <string>site.host ];
    }
    
    var hosts: string[] = (site.host as string[]).map((host) => {
        return host.toLowerCase();
    });
    
    if (!Contains(hosts, lowerHost)) {
        if (site.noSubHost)
            return false;
        
        var matched: boolean = false;
        for(var i = hosts.length; i--; ) {
            if (EndWith(hosts[i], topHostMask)) {
                matched = true;
                break;
            }
        }
        
        if (!matched) return false;
    }
    
    if (site.path) {
        return CheckPath(location.pathname, site.path);
    }
    
    return true;
}

export function Get(id: string): SiteRule
{
    for(var i = Sites.length; i--; ) {
        if (Sites[i].id == id) {
            return Sites[i];
        }
    }
    
    return null; 
}

export function Execute(id:string, event:string)
{
    switch(event.toLowerCase()) {
        case 'start':
            Get(id).onStart();
            break;
        
        case 'body':
            Get(id).onBody();
            break;
    }
}

export function FireEvent(event:string)
{
    for (var i = Sites.length; i--; ) {
        var rule = Sites[i];
        if (isFrame && rule.noFrame)
            continue;
        
        if (Check(rule, event)) {
            Run(rule, event);
        }
    }
}

export function Run(site:SiteRule, eventName: string): void
{
    var event: EventCallback ;
    
    switch(eventName.toLowerCase()) {
        case 'start':
            event = site.onStart;
            break;
        
        case 'body':
            event = site.onBody;
            break;
            
        default:
            error(`无效的事件 ${eventName}`);
            return ;
    }
    
    if (!site._styleApplied) {
        site._styleApplied = true;
        
        site.style = new StyleSheet();
        if (site.hide) {
            site.style.Hide(site.hide);
        }
        
        if (site.show) {
            site.style.Show(site.show);
        }
        
        if (site.css) {
            site.style.Add(site.css);
        }
        
        if (site.dl_icon) {
            site.style.Add (`
            
@font-face {
	font-family: ccc;
	src: url(https://cdn.bootcss.com/font-awesome/4.2.0/fonts/fontawesome-webfont.woff) format('woff');
	font-weight: normal;
	font-style: normal;
}

${downloadIconClass}::before {
	font-family: ccc;
	content: "\f019";
	padding-right: .5em;
}

.jx_hide {
	display: none;
}

            `);
        }
    }
    
    if (!event) return ;
    
    info(`执行规则: ${site.id} 于 ${site.name} [事件: ${eventName}]`);
    event.call(this);
}

export interface SiteRule {
    id: string;
    name: string;
    onStart: EventCallback;
    onBody: EventCallback;
    
    subModule: boolean;
    
    host: string[]|string;
    path?: string|PathCheckCallback|RegExp|string[]|PathCheckCallback[]|RegExp[];
    includeSubHost: boolean;
    
    hide?: string;
    show?: string;
    css?: string;
    
    noSubHost?: boolean;
    dl_icon?: boolean;
    
    _styleApplied?: boolean;
    style?: StyleSheet;
    
    noFrame?: boolean;
}

interface PathCheckCallback {
    (path: string): boolean
}

interface EventCallback {
    (): void
}