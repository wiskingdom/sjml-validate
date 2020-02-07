const path = require('path');

const toWXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');
try {
  const p = text.split(/[\n\r]+/)
  .map(str => str.replace(/ +/g, ' ').trim());
  obj.SJML.text = { p };

} catch (e) {
  console.log(e.message);
}
  const p = text.split(/[\n\r]+/)
    .map(str => str.replace(/ +/g, ' ').trim());
  obj.SJML.text = { p };

return obj;
};

const toNXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');
  obj.SJML.text = text.map(item => {
    const att_id = item.att_id.replace(/^(..)OR(.+)$/, '$1RW$2');
    const att_topic_or = item.att_topicOr;
    const p = Array.isArray(item.p) ? item.p : [item.p] ;
    const summary = item.summary.replace(/[\n\r]+/g, ' ').trim();

    delete item.att_topicOr;
    return { ...item, att_id, att_topic_or, p, summary };
  });
  return obj;
};

const tegPrep = str => str
  .replace(/ +/g, ' ')
  .replace(/([\.\?\,]) +?(<\/unclear>)/g, '$1$2')
  .replace(/([\.\?\,]) +?(<\/trunc>)/g, '$1$2')
  .replace(/^(<unclear>) +?([^ ])/g, '$1$2')
  .replace(/^(<trunc>) +?([^ ])/g, '$1$2')
  .replace(/(<unclear\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<unclear\/>)/g, '$1 $2')
  .replace(/(<trunc\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<trunc\/>)/g, '$1 $2')
  .replace(/(<anon .+?\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<anon .+?\/>)/g, '$1 $2')
  .replace(/ +/g, ' ')
  .trim();

const editSDRW = obj => {
  const { text } =  obj.SJML;
  obj.SJML.text = text.map(item => {
    if (item.u) {
      const { str } = item.u;
      item.u.str = tegPrep(str);
    }
    return item;
  });
  return obj;
}
const checkTagSide = ({ obj, inputFileName }) => {
  const { text } =  obj.SJML;
  const { innerSpace, sideChar }  = text.reduce((acc, curr) => {
    if (curr.u) {
      const { str } = curr.u;
      if (str.match(/[^ ]<[^>]+?>[^ ]/)) {
        acc.sideChar = true;
      } else if (str.match(/ <\//)) {
        acc.innerSpace = true;
      }
    }
    return acc;
  }, {});
  if (innerSpace && sideChar) {
    const type = 'inner&side'
    return [[inputFileName, type]];
  } else if (innerSpace && !sideChar) {
    const type = 'inner'
    return [[inputFileName, type]];
  } else if (!innerSpace && sideChar) {
    const type = 'side'
    return [[inputFileName, type]];
  } 

  return false;
};
const checkAnon = ({ obj, inputFileName }) => {
  const { text } =  obj.SJML;
  const { singleName, multiName } = text.reduce((acc, curr) => {
    if (curr.u) {
      const { str } = curr.u;
      if (str.match(/<anon type="name"\/>/)) {
        acc.singleName = true;
      }
      if (str.match(/<anon type="name" n=.+?\/>/)) {
        acc.multiName = true;
      }
    }
    return acc;
  }, {});
  if (singleName && multiName) {
    const type = 'anonName';
    
    return [[inputFileName, type]];
    
  }
  return false;
};
const checkInitial = ({ obj, inputFileName }) => {
  const { text } =  obj.SJML;
  if (text[0].u) {
    const initialPerson = text[0].u.str.match(/,[남여]자,/);
    if (initialPerson) {
      const type = 'initPerson'
      return [[inputFileName, type]];
    }
  }
  return false
};

const identical = obj => obj;

const convertMap = {
  WXRW: toWXRW,
  WCRW: toWXRW,
  NXRW: toNXRW,
  SDRW: editSDRW,
  SXRW: editSDRW,
  EXRW: identical,
  SERW: identical,
  SFRW: identical,
};

const xConvert = container => {
  const { inputFileName, obj, schemaType, passParse } = container; 
  const { name } = path.parse(inputFileName);
  const outputFileName = name.replace(/^(..)OR(.+)$/, '$1RW$2') + '.sjml';
  if (!passParse) {
    return { ...container, outputFileName };
  }
  const convertedObj = convertMap[schemaType](obj);

  let extraLog = [];
  if (['SDRW'].includes(schemaType)) {
    const tagType = checkTagSide({ obj, inputFileName });
    if (tagType) {
      extraLog = [...extraLog, ...tagType];
    }
    
    const anonType = checkAnon({ obj, inputFileName });
    if (anonType) {
      extraLog = [...extraLog, ...anonType];
    }
    const initType = checkInitial({ obj, inputFileName });
    if (initType) {
      extraLog = [...extraLog, ...initType];
    }
  }


  return { ...container, obj: convertedObj, outputFileName, extraLog };
} 

module.exports = { xConvert };