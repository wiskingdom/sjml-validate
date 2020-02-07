const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv(); 

const checkTagSide = ({ obj, reportFileName }) => {
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
    return [[reportFileName, type]];
  } else if (innerSpace && !sideChar) {
    const type = 'inner'
    return [[reportFileName, type]];
  } else if (!innerSpace && sideChar) {
    const type = 'side'
    return [[reportFileName, type]];
  } 
  return false;
};
const checkAnon = ({ obj, reportFileName }) => {
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
    return [[reportFileName, type]];
  }
  return false;
};
const checkInitial = ({ obj, reportFileName }) => {
  const { text } =  obj.SJML;
  if (text[0].u) {
    const initialPerson = text[0].u.str.match(/,[남여]자,/);
    if (initialPerson) {
      const type = 'initPerson'
      return [[reportFileName, type]];
    }
  }
  return false
};

const sExtraLog = ({ obj, reportFileName }) => {
  let extraLog = [];
  const tagType = checkTagSide({ obj, reportFileName });
  if (tagType) {
    extraLog = [...extraLog, ...tagType];
  }
  const anonType = checkAnon({ obj, reportFileName });
  if (anonType) {
    extraLog = [...extraLog, ...anonType];
  }
  const initType = checkInitial({ obj, reportFileName });
  if (initType) {
    extraLog = [...extraLog, ...initType];
  }
  return extraLog;
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
  const valid = validate(obj);
  if (!valid) {
    const { dataPath, message } = validate.errors[0];
    validLog = [reportFileName, dataPath, message]
  }
  const passValid = !!valid;
  
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