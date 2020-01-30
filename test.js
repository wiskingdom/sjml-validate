const chardet = require('chardet');
const obj = { a: '12', b: '34'};

console.log({ ...obj, a:'85' });

const arr = ['abx'];
console.log(arr.join('\n'));

const encoding = chardet.detectFileSync('sample/enc.sjml', { sampleSize: 256 });

console.log(encoding);