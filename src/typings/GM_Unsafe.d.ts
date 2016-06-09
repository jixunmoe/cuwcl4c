
declare class ErrorUnsafeSuccess extends Error {}
declare function unsafeOverwriteFunctionSafeProxy (...args: any[]): void;
declare function unsafeExec(callback: Function, ...args: any[]): void;

declare function exportFunction(
    func: Function,
    targetScope: Object,
    options?: ExportOptions
): Function;

interface ExportOptions {
    /**
     * determines the name of the function in targetScope.
     * 
     * If this is omitted, you need to assign the return value of exportFunction()
     * to an object in the target scope.
     */
    defineAs: string;

    /**
     * @deprecated / redundant from Firefox 34.
     * 
     * This option allows the exported function to accept callbacks as arguments.
     * Boolean, defaulting to false. This option is new in Firefox 33.
     * From Firefox 34 onwards this option has no effect: the exported
     * function is always able to accept callbacks as arguments.
     */
    allowCallbacks?: boolean;

    /**
     * do not check that arguments to the exported function are subsumed
     * by the caller: this allows the caller to pass objects with a different
     * origin into the exported function, which can then use its privileged
     * status to make cross-origin requests with them. Boolean, defaulting to false.
     * 
     * This option is new in Firefox 34.
     */
    allowCrossOriginArguments?: boolean;
}

declare function cloneInto <T> (
    obj: T,
    targetScope: Object,
    options?: CloneOptions
): T;

interface CloneOptions {
    cloneFunctions: boolean;
    wrapReflectors: boolean;
}
