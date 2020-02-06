const fs = require('fs');
const xToJ = require('fast-xml-parser');

const filePath = 'sample\\NXOR\\NIOR1900000013.xml';
const xml = fs.readFileSync(filePath, 'utf8');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
};

try {
var obj = xToJ.parse(xml, parseOptions, true);
// for xmls have no p tags
fs.writeFileSync('output/sample.json', JSON.stringify(obj, null, 2));


} catch (error) {
console.log(`${filePath}\t${error.message}`);

}
