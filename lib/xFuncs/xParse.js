const xToJ = require('fast-xml-parser');
const chalk = require('chalk');

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
  const parseLog = e ? [[inputFileName, e.line, e.code, e.msg]] : [];

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
  let parseLog = e ? [[inputFileName, e.line, e.code, e.msg]] : [];

  const xmlparts = inputXml.split(/(<\/?text>)/);
  const cntPreLines = xmlparts[0].split(/[\n\r]+/).length;
  const headerxml = [...xmlparts.slice(0, 2), ...xmlparts.slice(3)].join('\n');
  const obj = passParse ? xToJ.parse(headerxml, parseOptions) : {};
    
  if (passParse) {
    const textObj = xmlparts[2].trim().split(/[\n\r]+/)
      .map((line, index) => {
        if (m = line.match(/<u who="(.+?)" n="(.+?)">(.*?)<\/u>/)) {
          return { tag: 'u', att_who: m[1], att_n: m[2], cdata: m[3], serialNum: index }
        } else if (m = line.match(/<note>(.*?)<\/note>/)) {
          return { tag: 'note', cdata: m[1], serialNum: index }
        } else {
          const lineNum = cntPreLines + index + 1;
          parseLog = [[inputFileName, lineNum, 'InvalidLine', line]];
          passParse = false;
          return { tag: 'misc', cdata: line, serialNum: index};
        }
      });
    const u = textObj.filter(item => item.tag === 'u');
    const note = textObj.filter(item => item.tag === 'note');

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
    SDRW: sParse,  //일상대화
    SERW: sParse,  //준구어(대본)
    SFRW: sParse,  //준구어(연설)
    EXRW: wParse,  //웹
    MDRW: wParse,  //메신저대화
  };
  const parsedContainer = parseMap[schemaType](container);

  const fileIdPatternMap = {
    WXRW: /^W[ABZ]RW/,  //문어
    WCRW: /^WCRW/,  //문어(잡지)
    NXRW: /^N[WLPIZ]RW/,  //신문
    SXRW: /^S[AB]RW/,  //구어
    SDRW: /^SDRW/,  //일상대화
    SERW: /^SERW/,  //준구어(대본)
    SFRW: /^SFRW/,  //준구어(연설)
    EXRW: /^E[SBPR]RW/,  //웹
    MDRW: /^MDRW/,  //메신저대화
  }
  if (parsedContainer.obj.SJML) {
    const { SJML } = parsedContainer.obj
    const { header } = schemaType === 'MDRW' ? SJML[0] : SJML;
    const { fileId } = header.fileInfo;
    if (!fileId.match(fileIdPatternMap[schemaType])) {
      console.error(chalk
        .yellowBright(`ERROR: schema and file are unmached: ${schemaType}, ${fileId}`)
      );
      console.error(chalk.yellowBright('process.exit()'));
      process.exit();
    }
  } 
  return parsedContainer;
} 

module.exports = { xParse };