const fs = require('fs');
const xToJ = require('fast-xml-parser');
const { xEscape } = require('./lib/xTools');

const filePath = 'C:\\Users\\korean\\Desktop\\ex\\WBOR1900004665.sjml';
const xml = fs.readFileSync(filePath, 'utf8');
/*
const xmlparts = xml.split(/<\/?text>/);
const headerxml = [xmlparts[0], xmlparts[2]].join('\n');
const textObj = xmlparts[1].trim().split(/[\n\r]+/)
  .map(line => {
    const trimmed = line.trim()
    if (trimmed.match(/^<u who=".+?" n=".+?">.+?<\/u>$/)) {
      const m = trimmed.match(/<u who="(.+?)" n="(.+?)">(.+?)<\/u>/)
      return { u: { att_who: m[1], att_n: m[2], str: m[3] } }
    } else if (trimmed.match(/^<note>.+?<\/note>$/)) {
      const m = trimmed.match(/<note>(.+?)<\/note>/)
      return { note: m[1] }
    } else {
      console.log(trimmed)
      return { misc: ''};
    }
  });
*/
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
// obj.text = textObj;
// for xmls have no p tags
fs.writeFileSync('C:\\Users\\korean\\Desktop\\ex\\sample.json', JSON.stringify(obj, null, 2));


} catch (error) {
console.log(`${filePath}\t${error.message}`);

}
