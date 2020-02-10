const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv /*, {singleError: true} */);

const plusIndex = str => {
  const re = /(\/\d+\/)/;
  const strParts = str.split(re);
  return strParts.map(elem => {
    if (elem.match(re)) {
      const plusN = Number.parseInt(elem.slice(1, -1)) + 1;
      return `/${plusN}/`
    }
    return elem;
  }).join('');
};

const skip = () => ({ validLog: [], passValid: true });

const uOrder = ({ obj, reportFileName }) => {
  const orderErrorIdx = obj.SJML.text.u
    .findIndex((elem, index) => elem.att_n !== `${index + 1}`);
  const validLog = orderErrorIdx > -1 ? [
      reportFileName,
      plusIndex(`/SJML/text/u/${orderErrorIdx}/att_n`),
      'should match with .u order'
    ] : [];
  const  passValid = orderErrorIdx > -1 ? false : true;
    return { validLog, passValid };
};

const tagList = [
  'unclear',
  'trunc',
  'anon',
  'vocal'
];
const getInvalidTag = str => {
  const matchs = str.match(/<(.+?)[ \/>]/g);
  const tags = matchs ? matchs.map(m => m.split(/[<>\/ ]+/).join('')) : [];
  return tags.find(tag => !tagList.includes(tag));
};
const invalidTag = ({ obj, reportFileName }) => {
  const invalidTagIdx = obj.SJML.text.u
    .findIndex(elem => getInvalidTag(elem.cdata));
  const hasInvalid = invalidTagIdx > -1;
  const invalidLine = hasInvalid ? obj.SJML.text.u[invalidTagIdx].cdata : '';
  const invalidTagName = getInvalidTag(invalidLine);
  const validLog = hasInvalid ? [
      reportFileName,
      plusIndex(`/SJML/text/u/${invalidTagIdx}/cdata`),
      `should NOT have invalid tag: ${invalidTagName}`
    ] : [];
  const  passValid = hasInvalid ? false : true;
    return { validLog, passValid };
};

const sAdditional = ({ obj, reportFileName }) => {
  const pipe = [
    uOrder,
    invalidTag
  ];
  return pipe.reduce((acc, f) => {
    if (acc.passValid) {
      return f({ obj, reportFileName })
    } else {
      return acc;
    }
  }, { validLog: [], passValid: true });
};

// controller
const xValidate = container => {
  // common validation
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
    validLog = [reportFileName, plusIndex(dataPath), message]
    passValid = false;
  } 
  // additional validatrion
  const additionalMap = {
    WXRW: skip,
    WCRW: skip,
    NXRW: skip,
    SXRW: sAdditional,
    SDRW: sAdditional,
    SERW: skip,
    SFRW: skip,
    EXRW: skip,
  };

  if (passValid) {
    const addValidate = additionalMap[schemaType]({ obj, reportFileName});
    validLog = addValidate.validLog;
    passValid = addValidate.passValid;
  }

  return { ...container, passValid, validLog };
}

module.exports = { xValidate };