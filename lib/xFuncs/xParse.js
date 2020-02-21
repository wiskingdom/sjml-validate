// import modules
const xToJ = require('fast-xml-parser');

// def functions
const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
  trimValues: false,
};

const lineParse = container => {
  const { inputFileName, inputXml, schemaType } = container;
  const addNum = schemaType === 'EXRW'? 1 : 0;
  return inputXml.split(/[\n\r]+/).reduce((acc, curr, index) => {
    if (curr.match(/^\s*?<.+<\//)) {
      const validness = xToJ.validate(curr);
      const passParse = validness === true;
      const e = passParse ? false : validness.err;
      const parseLog = e ? [[inputFileName, index + addNum, e.code, e.msg, curr]] : [];
      return [...acc, ...parseLog];
    }
    return acc;
  }, []);
}

const wParse = container => {
  const { inputFileName, inputXml } = container;
  const validness = xToJ.validate(inputXml);
  const passParse = validness === true;
  
  const e = passParse ? false : validness.err;

  const inintParseLog = e ? [[inputFileName, e.line, e.code, e.msg]] : [];
  const addParseLog = passParse ? []: lineParse(container);
  const joinParseLog = [...inintParseLog, ...addParseLog];
  const parseLog = joinParseLog[0] && joinParseLog[1] && joinParseLog[0][1] === joinParseLog[1][1] 
    ? joinParseLog.slice(1) : joinParseLog;

  const obj = passParse ? xToJ.parse(inputXml, parseOptions) : {};

  return { ...container, obj, passParse, parseLog };
};

const addGroupParse = container => {
  const { inputFileName, inputXml } = container;
  const lines = inputXml.split(/[\n\r]+/);
  const addGroupTagXml = [
    lines[0],
    '<SJMLGROUP>',
    ...lines.slice(1),
    '</SJMLGROUP>'
  ].join('\n');
  const validness = xToJ.validate(addGroupTagXml);
  const passParse = validness === true;
  
  const e = passParse ? false : validness.err;
  const inintParseLog = e ? [[inputFileName, e.line - 1, e.code, e.msg]] : [];
  const addParseLog = passParse ? []: lineParse(container);
  const joinParseLog = [...inintParseLog, ...addParseLog];
  const parseLog = joinParseLog[0] && joinParseLog[1] && joinParseLog[0][1] === joinParseLog[1][1] 
    ? joinParseLog.slice(1) : joinParseLog;

  const obj = passParse ? xToJ.parse(addGroupTagXml, parseOptions) : {};

  return { ...container, obj, passParse, parseLog };
};

const nParse = container => {
  const parsedContainer = wParse(container)
  const { obj, passParse } = parsedContainer;
  if (passParse) {
    const { text } = obj.SJML;
    obj.SJML.text = text.map(item => {
      const p = Array.isArray(item.p) ? item.p : [item.p];
      return { ...item, p };
    });
  }
  return { ...parsedContainer, obj};
};

const seParse = container => {
  const parsedContainer = wParse(container)
  const { obj, passParse } = parsedContainer;
 
  if (passParse) {
    const { episode } = obj.SJML.text;
    obj.SJML.text.episode = episode.map(epItem => {
      epItem.scene = Array.isArray(epItem.scene) ? epItem.scene : [epItem.scene];
      const scene = epItem.scene.map(scItem => {
        if (scItem) {
          if (scItem.stage) {
            scItem.stage = Array.isArray(scItem.stage) ? scItem.stage : [scItem.stage];
          }
          if (scItem.sp) {
            scItem.sp = Array.isArray(scItem.sp) ? scItem.sp : [scItem.sp];
          }
        }

        return scItem;
      });

      return { ...epItem, scene };
    });
  }
  return { ...parsedContainer, obj};
};

const eParse = container => {
  const parsedContainer = addGroupParse(container)
  const { obj, passParse } = parsedContainer;
  if (passParse) {
    obj.SJMLGROUP.SJML = Array.isArray(obj.SJMLGROUP.SJML) ? obj.SJMLGROUP.SJML : [obj.SJMLGROUP.SJML];
    const { SJML } = obj.SJMLGROUP;
    obj.SJMLGROUP.SJML = SJML.map(item => {
      item.text.p = Array.isArray(item.text.p) ? item.text.p : [item.text.p];
      return item;
    });
  }
  //fs.writeFileSync('sample.json', JSON.stringify(obj, null ,2))
  return { ...parsedContainer, obj};
};

const sParse = container => {
  const { inputFileName, inputXml } = container;
  const validness = xToJ.validate(inputXml);
  let passParse = validness === true;
  const e = passParse ? false : validness.err;
  const inintParseLog = e ? [[inputFileName, e.line, e.code, e.msg]] : [];
  const addParseLog = passParse ? []: lineParse(container);
  const joinParseLog = [...inintParseLog, ...addParseLog];
  let parseLog = joinParseLog[0] && joinParseLog[1] && joinParseLog[0][1] === joinParseLog[1][1] 
    ? joinParseLog.slice(1) : joinParseLog;

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
          parseLog = [...parseLog, [inputFileName, lineNum, 'InvalidLine', line]];
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

const mParse = container => {
  const { inputFileName, inputXml } = container;
  const validness = xToJ.validate(inputXml);
  let passParse = validness === true;
  const e = passParse ? false : validness.err;
  const inintParseLog = e ? [[inputFileName, e.line, e.code, e.msg]] : [];
  const addParseLog = passParse ? []: lineParse(container);
  const joinParseLog = [...inintParseLog, ...addParseLog];
  let parseLog = joinParseLog[0] && joinParseLog[1] && joinParseLog[0][1] === joinParseLog[1][1] 
    ? joinParseLog.slice(1) : joinParseLog;

  const xmlparts = inputXml.split(/(<\/?text>)/);
  const cntPreLines = xmlparts[0].split(/[\n\r]+/).length;
  const headerxml = [...xmlparts.slice(0, 2), ...xmlparts.slice(3)].join('\n');
  const obj = passParse ? xToJ.parse(headerxml, parseOptions) : {};
    
  if (passParse) {
    const textObj = xmlparts[2].trim().split(/[\n\r]+/)
      .map((line, index) => {
        if (m = line.match(/<u date="(.+?)" n="(.+?)" time="(.+?)" who="(.+?)">(.*?)<\/u>/)) {
          return { tag: 'u', att_date: m[1], att_n: m[2], att_time: m[3], att_who: m[4], cdata: m[5], serialNum: index };

        } else if (m = line.match(/<u date="(.+?)" n="(.+?)" time="(.+?)" who="(.+?)"\/>/)) {
          return { tag: 'u', att_date: m[1], att_n: m[2], att_time: m[3], att_who: m[4], cdata: '', serialNum: index };

        } else {
          const lineNum = cntPreLines + index + 1;
          parseLog = [...parseLog, [inputFileName, lineNum, 'InvalidLine', line]];
          passParse = false;
          return { tag: 'misc', cdata: line, serialNum: index};
        }
      });
    const u = textObj.filter(item => item.tag === 'u');

    obj.SJML.text = { u };
    const { personId } = obj.SJML.header.profileInfo;
    if (!Array.isArray(personId)) {
      obj.SJML.header.profileInfo.personId = [personId];
    } 
  }
  return { ...container, obj, passParse, parseLog };
};

// main function 
const xParse = container => {
  const { schemaType, runType, inputFileName } = container;
  const parseMap = {
    WXRW: wParse,  //문어
    WCRW: wParse,  //문어(잡지)
    NXRW: nParse,  //신문
    SXRW: sParse,  //구어
    SDRW: sParse,  //일상대화
    SERW: seParse,  //준구어(대본)
    SFRW: sParse,  //준구어(연설)
    EXRW: eParse,  //웹
    MXRW: mParse,  //메신저대화
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
    MXRW: /^M[DM]RW/,  //메신저대화
  }
  if (parsedContainer.obj.SJML) {
    const { SJML } = parsedContainer.obj
    const { header } = schemaType === 'EXRW' ? SJML[0] : SJML;
    const { fileId } = header.fileInfo;
    const resultFileId = runType === 'convert' 
      ? fileId.replace(/^(..)OR(.+)$/, '$1RW$2')
      : fileId;
    if (!resultFileId.match(fileIdPatternMap[schemaType])) {
      parsedContainer.parseLog = [[inputFileName, '', 'unmatch schema & fileId', 'invalid or No file id']];
      parsedContainer.passParse = false;
    }
  } 
  return parsedContainer;
} 

// export module
module.exports = { xParse };
