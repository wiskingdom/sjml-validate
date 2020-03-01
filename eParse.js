const fs = require('fs');
const xToJ = require('fast-xml-parser');

// def functions
const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
  trimValues: false,
};


const xml = fs.readFileSync('sample/EXRW/ESRW19W00033902.sjml', 'utf8');


const parseGroup = xml => {
  const sjmls = xml.trim().split('</SJML>').slice(0, -1).map(xml => {
    const closedXml = xml + '</SJML>';
    const { SJML } = xToJ.parse(closedXml, parseOptions);
    const { p } = SJML.text
    SJML.text.p = Array.isArray(p) ? p : [p];
    return SJML;
  });
  
  return { SJMLGROUP: { SJML: sjmls} };
};



fs.writeFileSync('output/result.json', JSON.stringify(parseGroup(xml), null, 2));