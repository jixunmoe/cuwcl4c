
import { } from "../typings/UserScript.d";
/// <reference path="../typings/globals/jquery/index.d.ts" />

export function WaitUntil(
    check: string|string[]|CheckCallback,
    cb: Callback,
    nTimeout: number|boolean = 10000,
    nInterval: number = 150)
{
    if ('string' == typeof check) {
        check = (<string>check).split('.');
    }
    
    var isReady: CheckCallback;
    
    if ($.isArray(check)) {
        isReady = () => {
            var r: any = unsafeWindow;
            for (var i = 0; i < check.length; i++) {
                r = r[check[i]];
                if (!r) return false;
            }
            
            return true
        };
    } else {
        isReady = () => {
            try {
                return (<CheckCallback>check)();
            } catch (error) {
                return false;
            }
        };
    }
    
    var timer = setInterval(() => {
        if (!isReady()) {
            return ;
        }
        
        clearInterval(timer);
        cb.call(this);
    }, nInterval);
    
    if (nTimeout !== true) {
        setTimeout(() => {
            clearInterval(timer);
        }, nTimeout as number);
    }
}

interface Callback {
    (): void
}

interface CheckCallback {
    (...args: any[]): boolean
}