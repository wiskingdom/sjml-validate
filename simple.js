const fs = require('fs');
const xToJ = require('fast-xml-parser');
const { xEscape } = require('./lib/xFuncs/xEscape.js');

const filePath = 'C:\\Users\\yeon\\Desktop\\sample\\SERW\\SERW1900000041.sjml';
const xml = fs.readFileSync(filePath, 'utf8');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
  //trimValues: false,
};

const validness = xToJ.validate(xml);
const passParse = validness === true;

const obj = passParse ? xToJ.parse(xml, parseOptions) : {};
console.log(validness)

fs.writeFileSync('C:\\Users\\yeon\\Desktop\\sample.json', JSON.stringify(obj, null, 2));
