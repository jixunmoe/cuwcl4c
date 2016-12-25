// Generate site list for building 
/// <reference path="typings/node/node.d.ts" />

var charTables = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var tableSize = charTables.length;

var siteDir = __dirname + '/../src/site/';
var fs = require ('fs');

var ret = [''];
var codes = fs.readdirSync(siteDir).map ((m: string, i:number) => {
    if (m.slice(-3) != '.ts')
        return '';
    
    var moduleName = UniqueName(i);
    var fileName   = m.slice(0,-3);

    return `

import * as ${moduleName} from "./site/${fileName}";
${moduleName}.Rules.forEach(Add);

    `.trim();
});

module.exports = `

import { Add } from "./SiteRule";

// Rules generated
${codes.join('\n\n')}

`.trim();

function UniqueName(i:number): string
{
    var n: number;
    var r: string[] = [];

    do {
        n = i % tableSize;
        i = (i - n) / tableSize;
        r.push(charTables[n]);
    } while (i > 0);

    return r.join('');
}