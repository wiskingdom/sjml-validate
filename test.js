const fs = require('fs');
const xToJ = require('fast-xml-parser');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
  trimValues: false,
};
const inputXml = fs.readFileSync('att.xml', 'utf8');
const obj = xToJ.parse(inputXml, parseOptions, true);

fs.writeFileSync('sample.json', JSON.stringify(obj, null, 2));