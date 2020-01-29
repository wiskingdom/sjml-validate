const fs = require('fs');
const xToJ = require('fast-xml-parser');
const { xEscape } = require('./lib/xTools.js');

const filePath = 'sample/NIOR1900000013.xml';
const xml = fs.readFileSync(filePath, 'utf8');
const escapedXml = xEscape(xml);


try {
xToJ.parse(xml, {ignoreAttributes : false}, true);
} catch (error) {
console.log(`${filePath}\t01\t${error.message}`);

}

try {
var obj = xToJ.parse(escapedXml, {ignoreAttributes : false}, true);
// for xmls have no p tags
fs.writeFileSync('sample.json', JSON.stringify(obj, null, 2));


} catch (error) {
console.log(`${filePath}\t02\t${error.message}`);

}
