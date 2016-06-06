import { } from "../typings/cryptojs/cryptojs.d";


export function Base64Decode (str: string): string
{
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(str));
}

export function MD5_Bytes2Base64(bytes:Uint8Array): string
{
    return CryptoJS
        .MD5(CryptoJS.lib.ByteArray(bytes))
        .toString(CryptoJS.enc.Base64);
}

export function MD5_String2Hex(text:string): string
{
    return CryptoJS.MD5(text).toString();
}