const xToJ = require('fast-xml-parser');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false
};

const wParse = container => {
  const { inputFileName, inputXml } = container;
  let obj = {};
  let parseLog = [];
  let passParse = true;
  try {
    obj = xToJ.parse(inputXml, parseOptions, true);
  } catch (error) {
    parseLog = [inputFileName, error.message];
    passParse = false;
  }
  return { ...container, obj, passParse, parseLog };
};

const nParse = container => {
  const { inputFileName, inputXml } = container;
  let obj = {};
  let parseLog = [];
  let passParse = true;
  try {
    obj = xToJ.parse(inputXml, parseOptions, true);
    const { text } = obj.SJML;
    obj.SJML.text = text.map(item => {
      const p = Array.isArray(item.p) ? item.p : [item.p] ;
      return { ...item, p };
    });
  } catch (error) {
    parseLog = [inputFileName, error.message];
    passParse = false;
  }
  return { ...container, obj, passParse, parseLog };
};

const uParse = container => {
  const { inputFileName, inputXml } = container;
  let obj = {};
  let parseLog = [];
  let passParse = true;
  try {
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
          parseLog = [inputFileName, line];
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
  } catch (error) {
    parseLog = [inputFileName, error.message];
    passParse = false;
  }
  try {
    function UOrderException(message) {
      this.message = message;
      this.name = 'UOrderException';
   }
    let num = 1;
    obj.SJML.text.forEach(item => {
      if (item.u) {
        const { str, att_n } = item.u;
        xToJ.parse(`<u>${str}</u>`, parseOptions, true)
        if (`${num}` !== att_n) {
          throw new UOrderException(`<u n="${att_n}"> order mismatch`);
        }
        num += 1;
      }
    });
  } catch (error) {
    parseLog = [inputFileName, error.message];
    passParse = false;
  }
  return { ...container, obj, passParse, parseLog };
};

// controller
const xParse = container => {
  const { schemaType, passEncoding } = container;
  if (!passEncoding) {
    return container;
  }
  const parseMap = {
    WXRW: wParse,  //문어
    WCRW: wParse,  //문어(잡지)
    NXRW: nParse,  //신문
    SXRW: uParse,  //구어
    SDRW: uParse,  //구어(일상대화)
    SERW: uParse,  //준구어(대본)
    SFRW: uParse,  //준구어(연설)
    EXRW: wParse,  //웹
  };
    
  return parseMap[schemaType](container);
} 

module.exports = { xParse };