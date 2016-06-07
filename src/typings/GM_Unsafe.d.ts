
declare class ErrorUnsafeSuccess extends Error {}
declare function unsafeOverwriteFunctionSafeProxy (...args: any[]): void;
declare function unsafeExec(callback: UnsafeExecCallback, ...args: any[]): void;

interface UnsafeExecCallback {
    (...args: any[]): void;
}