const xToJ = require('fast-xml-parser');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false
};

const xParse = container => {
  const { inputFileName, schemaType, inputXml, passEncoding } = container;
  if (!passEncoding) {
    return container;
  }
  let obj = {};
  let parseLog = ''
  let passParse = true;

  try {
    if (['SDRW', 'SXRW'].includes(schemaType)) {
      const xmlparts = inputXml.split(/<\/?text>/);
      const headerxml = [xmlparts[0], xmlparts[2]].join('\n');
      const textObj = xmlparts[1].trim().split(/[\n\r]+/)
        .map(line => {
          const trimmed = line.trim()
          if (trimmed.match(/^<u who=".+?" n=".+?">.*?<\/u>$/)) {
            const m = trimmed.match(/<u who="(.+?)" n="(.+?)">(.*?)<\/u>/)
            return { u: { att_who: m[1], att_n: m[2], str: m[3] } }
          } else if (trimmed.match(/^<note>.+?<\/note>$/)) {
            const m = trimmed.match(/<note>(.+?)<\/note>/)
            return { note: m[1] }
          } else {
            parseLog = (`${inputFileName}\t${line}`);
            passParse = false;
            return { line };
          }
        });
      obj = xToJ.parse(headerxml, parseOptions, true);
      obj.SJML.text = textObj;
      const { personId } = obj.SJML.header.profileInfo;
      if (!Array.isArray(personId)) {
        obj.SJML.header.profileInfo.personId = [personId];
      }
    } else {
      obj = xToJ.parse(inputXml, parseOptions, true);
    }
    
  } catch (error) {
    parseLog = (`${inputFileName}\t${error.message}`);
    passParse = false;
  }

  return { ...container, obj, passParse, parseLog };
}

module.exports = { xParse };