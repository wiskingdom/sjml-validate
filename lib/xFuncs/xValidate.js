const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv /*, {singleError: true} */);

const plusIndex = str => {
  const re = /(\d+)/;
  const strParts = str.split(re);
  return strParts.map(elem => {
    if (elem.match(re)) {
      const plusN = Number.parseInt(elem) + 1;
      return `${plusN}`
    }
    return elem;
  }).join('');
};

const skip = () => [];

const uOrder = ({ obj, reportFileName }) => {
  const orderErrorIdx = obj.SJML.text.u
    .findIndex((elem, index) => elem.att_n !== `${index + 1}`);
  const validLog = orderErrorIdx > -1 ? [
      reportFileName,
      plusIndex(`/SJML/text/u/${orderErrorIdx}/att_n`),
      'should match with .u order'
    ] : [];
    return validLog[0] ? [validLog] : [];
};

const sTagList = [
  'unclear',
  'trunc',
  'anon',
  'vocal'
];
const mTagList = [
  'anon',
  'emoji',
  'message',
];

const getInvalidTag = tagList => str => {
  const matchs = str.match(/<(.+?)[ \/>]/g);
  const tags = matchs ? matchs.map(m => m.split(/[<>\/ ]+/).join('')) : [];
  return tags.find(tag => !tagList.includes(tag));
};
const invalidTag = tagList => ({ obj, reportFileName }) => {
  return obj.SJML.text.u.reduce((acc, curr, index) => {
      const invalidTagName = getInvalidTag(tagList)(curr.cdata);
      if (invalidTagName) {
        const invalidTagLog = [
          reportFileName,
          plusIndex(`/SJML/text/u/${index}/cdata`),
          `should NOT have invalid tag: ${invalidTagName}`
        ];
        return [...acc, invalidTagLog];
      }
      return acc;
    }, []);
};

const sAdditional = ({ obj, reportFileName }) => {
  const pipe = [
    uOrder,
    invalidTag(sTagList)
  ];
  return pipe.reduce((acc, f) => [...acc, ...f({ obj, reportFileName })], []);
};

const mAdditional = ({ obj, reportFileName }) => {
  const pipe = [
    uOrder,
    invalidTag(mTagList)
  ];
  return pipe.reduce((acc, f) => [...acc, ...f({ obj, reportFileName })], []);
};

// controller
const xValidate = container => {
  // common validation
  const { inputFileName, outputFileName, schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const reportFileName = outputFileName || inputFileName;
  const schema = require(`../schema/${schemaType}.json`);
  const validate = ajv.compile(schema);
  
  let validLog = [];
  const valid = validate(obj);
  if (!valid) {
    const commonValidLog = validate.errors
      .map(({ dataPath, message }) =>[reportFileName, plusIndex(dataPath), message]);
    validLog = commonValidLog
  } 
  // additional validatrion
  const additionalMap = {
    WXOR: skip,
    WXOR: skip,
    WCOR: skip,
    NXRW: skip,
    WCRW: skip,
    NXRW: skip,
    SXRW: sAdditional,
    SDRW: sAdditional,
    SERW: skip,
    SFRW: skip,
    EXRW: skip,
    MDRW: mAdditional,  //메신저대화
  };

  const addValidateLog = additionalMap[schemaType]({ obj, reportFileName});
  validLog = [...validLog, ...addValidateLog];
  const passValid = !validLog.length;
 

  return { ...container, passValid, validLog };
}

module.exports = { xValidate };