const fs = require('fs');
const xToJ = require('fast-xml-parser');
const { xEscape } = require('./lib/xTools');

const filePath = 'sample\\EXRW\\EBRW1920008937.sjml';
const xml = fs.readFileSync(filePath, 'utf8');

const escXml =  xEscape({ 
  schemaType: 'EXRW',
  inputXml: xml,
  passEncoding: true
}).inputXml

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
};

try {
var obj = xToJ.parse(escXml, parseOptions, true);
// for xmls have no p tags
fs.writeFileSync('output/sample.json', JSON.stringify(obj, null, 2));


} catch (error) {
console.log(`${filePath}\t${error.message}`);

}
