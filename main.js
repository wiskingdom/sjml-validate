const fs = require('fs');
const xToJ = require('fast-xml-parser');
var Ajv = require('ajv');
var ajv = new Ajv(); 

const { xEscape, toX } = require('./lib/xTools.js');


const schema = JSON.parse(fs.readFileSync('jsonschema/wr.json', 'utf8'));
var validate = ajv.compile(schema);
const xml = fs.readFileSync('wr/data2.sjml', 'utf8');
const escapedXml = xEscape(xml);

try {
  xToJ.parse(xml, {}, true);
} catch (error) {
  console.log(`01\t${error.message}`);

}

try {
  var obj = xToJ.parse(escapedXml, {}, true);
  const p = obj['SJML']['text'].split(/[\n\r]+/)
  .map(str => str.replace(/ +/g, ' ').trim());
  obj['SJML']['text'] = { p };

fs.writeFileSync('data2.json', JSON.stringify(obj, null, 2));
fs.writeFileSync('data2.sjml', toX('wr')(obj));
var valid = validate(obj);
if (!valid) {
  console.log(validate.errors);
}

} catch (error) {
  console.log(`02\t${error.message}`);
}
validate();