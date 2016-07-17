
/// <reference path="../typings/globals/jquery/index.d.ts" />

interface IStringDictionary {
    [key: string]: string
}

export function GetFlashVars(el: HTMLObjectElement|JQuery): IStringDictionary|any
{
    if (!el) return {};
    
    var ele: HTMLObjectElement = ('jquery' in el ? (el as JQuery)[0] : el) as HTMLObjectElement;
    
    if (ele.getAttribute('type') != 'flash')
        return {};
        
    var flashVars: IStringDictionary = {};
    var size = ele.childNodes.length;
    var flashObject: HTMLParamElement;
    for (let i = size; i--; ) {
        if ((<HTMLParamElement>ele.childNodes[i]).name == 'flashvars') {
            flashObject = <HTMLParamElement>ele.childNodes[i];
            flashObject.value.replace(/&amp;/g, '&')
                .replace(/([\s\S]+?)=([\s\S]+?)(&|$)/g, (n, key, value) => {
				// 利用正则的批量替换功能抓取数据
				flashVars [key] = decodeURIComponent(value);
                return '';
			});
            return flashVars;
        }
    }
    
    return {};
}



import {Contains} from "./Extension";
export function Parse(query:string): IStringDictionary
{
    var urlParams: string[];
    
    if (Contains (query, '?')) {
        urlParams = query.slice (query.indexOf('?') + 1).split('&');
    } else {
        urlParams = query.split('&');
    }
    
    var ret: IStringDictionary = {};
    var queryStr: string;
    var posEqual: number;
    for (var i = urlParams.length; i--;) {
        queryStr = urlParams[i].toString();
        posEqual = queryStr.indexOf('=');
        if (posEqual == -1) continue;

        ret[decodeURIComponent(queryStr.slice (0, posEqual))] =
            decodeURIComponent(queryStr.slice (posEqual + 1));
    }

    return ret;
}
