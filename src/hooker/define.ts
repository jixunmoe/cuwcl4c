function HookDefineHelper(
    method: string,
    callback: DefineHookCallback,
    args: any[]
): void
{
    var originalDefine: DefineSignature = (<any>window)[method];
    
    Object.defineProperty(window, method, {
        get: () => {
            return FakeDefine;
        },
        
        set: (value: DefineSignature) => {
            originalDefine = value;
        }
    });
    
    function FakeDefine (module: string, requires:string[], resolveCallback: DefineCallback) {
        return callback(module, requires, resolveCallback, args);
    }
    
    // 一点点小清洁
    var el = document.currentScript;
    el.parentNode.removeChild(el);
}

/**
 * callback 将转换为文字形式插入到页面。
 * 请注意不要调用脚本里的函数。
 * define ('module/name', ['jquery'], ()=> { proc });
 * 接收该函数，我们自己调用它。
 * 
 * @param method      在 `window` 的名称，一般是 define。
 * @param callback    回调参数
 * @param args        额外传输给 `callback` 的参数。
 */
export function HookDefine(
    method: string,
    callback: DefineHookCallback,
    ...args: string[]
): void
{
    var cbArgs = JSON.stringify(args);
    
    var script = document.createElement('script');
    script.textContent = `;(${HookDefineHelper})(
        ${method},
        ${callback},
        ${cbArgs}
    );`;
    
    document.head.appendChild(script);
}

interface DefineSignature {
    (module: string, requires:string[], resolveCallback: DefineCallback): void
}

/**
 * define() 的回调参数.
 * @param require   require 函数
 * @param exports   自己的导出函数
 * @param module    module.exports 可写
 */
interface DefineCallback{
    (require: RequireFunction, exports: any, module: any): any
}

/**
 * 钩子回调
 */
interface DefineHookCallback {
    (   module: string,
        requires:string[],
        resolveCallback: DefineCallback,
        ...args: any[]
    ):  void
}

/**
 * require('module')
 */
interface RequireFunction {
    (module: string): any
}
