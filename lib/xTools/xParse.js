const xToJ = require('fast-xml-parser');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
  trimValues: false,
};

const wParse = container => {
  const { inputFileName, inputXml } = container;
  const validness = xToJ.validate(inputXml);
  const passParse = validness === true;
  
  const e = passParse ? false : validness.err;
  const parseLog = e ? [inputFileName, e.line, e.code, e.msg] : [];

  const obj = passParse ? xToJ.parse(inputXml, parseOptions) : {};

  return { ...container, obj, passParse, parseLog };
};

const nParse = container => {
  const parsedContainer = wParse(container)
  const { obj, passParse } = parsedContainer;
  if (passParse) {
    obj.SJML.text = text.map(item => {
      const p = Array.isArray(item.p) ? item.p : [item.p];
      return { ...item, p };
    });
  }
  return { ...parsedContainer, obj};
};

const sParse = container => {
  const { inputFileName, inputXml } = container;
  const validness = xToJ.validate(inputXml);
  let passParse = validness === true;
  const e = passParse ? false : validness.err;
  let parseLog = e ? [inputFileName, e.line, e.code, e.msg] : [];
  let obj = {};
  let u = [];
  let note = [];

  if (passParse) {
    const xmlparts = inputXml.split(/<\/?text>/);
    const cntPreLines = xmlparts[0].split(/[\n\r]+/).length;
    const headerxml = [xmlparts[0], xmlparts[2]].join('\n');
    const textObj = xmlparts[1].trim().split(/[\n\r]+/)
      .map((line, index) => {
        if (m = line.match(/<u who="(.+?)" n="(.+?)">(.*?)<\/u>/)) {
          return { tag: 'u', att_who: m[1], att_n: m[2], cdata: m[3], serialNum: index }
        } else if (m = line.match(/<note>(.*?)<\/note>/)) {
          return { tag: 'note', cdata: m[1], serialNum: index }
        } else {
          const lineNum = cntPreLines + index + 1;
          parseLog = [inputFileName, lineNum, 'InvalidLine', line];
          passParse = false;
          return { tag: 'misc', cdata: line, serialNum: index};
        }
      });
    u = textObj.filter(item => item.tag === 'u');
    note = textObj.filter(item => item.tag === 'note');
    obj = xToJ.parse(headerxml, parseOptions);
  }
  if (passParse) {
    obj.SJML.text = { u };
    if (note[0]) {
      obj.SJML.text.note = note;
    }
    const { personId } = obj.SJML.header.profileInfo;
    if (!Array.isArray(personId)) {
      obj.SJML.header.profileInfo.personId = [personId];
    } 
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