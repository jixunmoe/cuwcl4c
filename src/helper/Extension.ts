
export function BeginWith (str: string, what: string): boolean
{
    return str.indexOf (what) === 0;
}

export function EndWith(str:string, what: string): boolean
{
    return str.slice(-what.length) == what;
}

export function Contains (str: string|any[], what: any): boolean
{
    return str.indexOf(what) != -1;
}

export function GetFirstKey(obj:Object): string
{
    return Object.keys(obj)[0];
}

export function GetFirstValue(obj:IStringDictionary): any
{
    try {
        return obj[GetFirstKey(obj)];
    } catch (ex) {
        return null;
    }
}

/**
 * 从链接获取文件后缀名。
 * 包括 `.` 字符，如 `.ts`
 */
export function GetExtensionFromUrl(url:string): string
{
    var m = url.match(/.+\/(?:[^.]+(\..+?))(?:\?|$)/);
    return m ? m[1] : null;
}

// Fisher-Yates Shuffle by community wiki(?)
// http://stackoverflow.com/a/6274398
export function Shuffle<T>(array:T[]): T[]
{
    var counter: number = array.length;
    var temp: T, index: number;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}



interface IStringDictionary {
    [key: string]: string
}