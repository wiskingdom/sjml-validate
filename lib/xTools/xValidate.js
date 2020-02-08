const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv(); 

const checkTagSide = ({ obj, reportFileName }) => {
  const { u } =  obj.SJML.text;
  const { innerSpace, sideChar }  = u.reduce((acc, curr) => {
    const { cdata } = curr;
    if (cdata.match(/[^ ]<[^>]+?>[^ ]/)) {
      acc.sideChar = true;
    } else if (cdata.match(/ <\//)) {
      acc.innerSpace = true;
    }
    return acc;
  }, {});
  if (innerSpace && sideChar) {
    const type = 'c<tag>c && space</tag>'
    return [[reportFileName, type]];
  } else if (innerSpace && !sideChar) {
    const type = 'space</tag>'
    return [[reportFileName, type]];
  } else if (!innerSpace && sideChar) {
    const type = 'c<tag>c'
    return [[reportFileName, type]];
  } 
  return false;
};
const checkAnon = ({ obj, reportFileName }) => {
  const { u } =  obj.SJML.text;
  const { singleName, multiName } = u.reduce((acc, curr) => {
      const { cdata } = curr;
      if (cdata.match(/<anon type="name"\/>/)) {
        acc.singleName = true;
      }
      if (cdata.match(/<anon type="name" n=.+?\/>/)) {
        acc.multiName = true;
      }
    return acc;
  }, {});
  if (singleName && multiName) {
    const type = '<anon type="name"/> & <anon type="name" n="n"/>';
    return [[reportFileName, type]];
  }
  return false;
};
const checkInitialU = ({ obj, reportFileName }) => {
  const { u } =  obj.SJML.text;
  const firstU = u[0];
  const initialPerson = firstU.cdata.match(/, *[남여]자 *,/);
  const initialWho = firstU.att_who;
  if (initialPerson || initialWho !== 'P1') {
    const type = '<u who="not P1" n="1">'
    return [[reportFileName, type]];
  }
  return false;
};

const sExtraLog = ({ obj, reportFileName }) => {
  let extraLog = {};
  const tagType = checkTagSide({ obj, reportFileName });
  if (tagType) {
    extraLog.checkTagSide = [...extraLog, ...tagType];
  }
  const anonType = checkAnon({ obj, reportFileName });
  if (anonType) {
    extraLog.checkAnon = [...extraLog, ...anonType];
  }
  const initType = checkInitialU({ obj, reportFileName });
  if (initType) {
    extraLog.checkInitialU = [...extraLog, ...initType];
  }
  return extraLog;
}

// 검증으로 옮김
const tagPrep = str => str
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
// 검증으로 옮김
const editSDRW = obj => {
  const { text } =  obj.SJML;
  obj.SJML.text.u = text.map(item => {
    const { cdata } = item;
    item.cdata = tagPrep(cdata);
    return item;
  });
  return obj;
}

const skipLog = () => [];

// controller
const xValidate = container => {
  const { inputFileName, outputFileName, schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const reportFileName = outputFileName || inputFileName;
  const schema = JSON.parse(fs.readFileSync(`schema/${schemaType}.json`, 'utf8'));
  const validate = ajv.compile(schema);
  
  let validLog = [];
  let passValid = true;
  const valid = validate(obj);
  if (!valid) {
    const { dataPath, message } = validate.errors[0];
    validLog = [reportFileName, dataPath, message]
    passValid = false;
  } else if (['SXRW', 'SDRW'].includes(schemaType)) {
    let num = 1;
    let dataPath = ''
    obj.SJML.text.u.forEach(item => {
      const { att_n } = item;
      if (`${num}` !== att_n) {
        dataPath = `.SJML.text.u[${num - 1}].att_n`
      }
      num += 1;
    });
    if (dataPath) {
      validLog = [reportFileName, dataPath, 'should match with .u order']
      passValid = false;
    }
  }

  const extraLogMap = {
    WXRW: skipLog,
    WCRW: skipLog,
    NXRW: skipLog,
    SXRW: sExtraLog,
    SDRW: sExtraLog,
    SERW: skipLog,
    SFRW: skipLog,
    EXRW: skipLog,
  };
  const extraLog = extraLogMap[schemaType]({ obj, reportFileName });

  return { ...container, passValid, validLog, extraLog };
}

module.exports = { xValidate };