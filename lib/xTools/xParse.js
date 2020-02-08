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

const sParse = container => {
  const { inputFileName, inputXml } = container;
  let obj = {};
  let parseLog = [];
  let passParse = true;
  try {
    const xmlparts = inputXml.split(/<\/?text>/);
    const headerxml = [xmlparts[0], xmlparts[2]].join('\n');
    const textObj = xmlparts[1].trim().split(/[\n\r]+/)
      .map((line, index) => {
        const trimmed = line.trim()
        if (trimmed.match(/^<u who=".+?" n=".+?">.*?<\/u>$/)) {
          const m = trimmed.match(/<u who="(.+?)" n="(.+?)">(.*?)<\/u>/)
          return { tag: 'u', att_who: m[1], att_n: m[2], cdata: m[3], serialNum: index }
        } else if (trimmed.match(/^<note>.*?<\/note>$/)) {
          const m = trimmed.match(/<note>(.*?)<\/note>/)
          return { tag: 'note', cdata: m[1], serialNum: index }
        } else {
          parseLog = [inputFileName, error.message];
          passParse = false;
          return { tag: 'misc', cdata: line, serialNum: index};
        }
      });
    const u = textObj.filter(item => item.tag === 'u');
    const note = textObj.filter(item => item.tag === 'note');
    const misc = textObj.filter(item => item.tag === 'misc');
   
    obj = xToJ.parse(headerxml, parseOptions, true);
    obj.SJML.text = { u };
    if (note[0]) {
      obj.SJML.text.note = note;
    }
    if (misc[0]) {
      obj.SJML.text.misc = misc;
    }
    const { personId } = obj.SJML.header.profileInfo;
    if (!Array.isArray(personId)) {
      obj.SJML.header.profileInfo.personId = [personId];
    } 
  } catch (error) {
    parseLog = [inputFileName, error.message];
    passParse = false;
  }
  try {
    obj.SJML.text.u.forEach(item => {
      const { cdata } = item;
      xToJ.parse(`<u>${cdata}</u>`, parseOptions, true)
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
    SXRW: sParse,  //구어
    SDRW: sParse,  //구어(일상대화)
    SERW: sParse,  //준구어(대본)
    SFRW: sParse,  //준구어(연설)
    EXRW: wParse,  //웹
  };
    
  return parseMap[schemaType](container);
} 

module.exports = { xParse };