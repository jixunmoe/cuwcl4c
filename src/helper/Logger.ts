import { Script } from "./Script";

interface IConsole {
    [key: string]: LogFunction
}

function DoLog(
    prefix: string,
    method: string,
    args: any[]
): void
{
    if (args.length < 1) return ;
    
    if (typeof args[0] == 'string') {
        args[0] = `[${Script.Name}][${prefix}] ${args[0]}`; 
    } else {
        args.splice(0, 0, `[${Script.Name}][${prefix}] ${args[0]}`);
    }
    
    (<IConsole><any>console)[method].apply(console, args);
}

function WrapLog(
    prefix: string,
    method: string
): LogFunction
{
    return (...args) => {
        return DoLog(prefix, method, args);
    }
}

interface LogFunction {
    (...args: any[]): void
}

function DoNothing () {}

export var log:   LogFunction = DoNothing;
export var info:  LogFunction = DoNothing;
export var error: LogFunction = DoNothing;
export var warn:  LogFunction = DoNothing;

export function EnableLogs () {
    log   = WrapLog('日志', 'log'  );
    info  = WrapLog('信息', 'info' );
    error = WrapLog('错误', 'error');
    warn  = WrapLog('警告', 'warn' );
}