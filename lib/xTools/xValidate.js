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

const checkSideChar = ({ u, reportFileName }) => {
  const sideChar = u.find(elem => elem.cdata.match(/[^ ]<[^>]+?>[^ ]/));
  return sideChar ? [['sideChar', reportFileName, sideChar.cdata]] : false;
};

const checkInnerSpace = ({ u, reportFileName }) => {
  const innerSpace = u.find(elem => elem.cdata.match(/ <\//));
  return innerSpace ? [['innerSpace', reportFileName, innerSpace.cdata]] : false;
};

const checkAnon = ({ u, reportFileName }) => {
  const noIdName = u.find(elem => elem.cdata.match(/<anon type="name"\/>/));
  const IdName = u.find(elem => elem.cdata.match(/<anon type="name" n=.+?\/>/));
  if (noIdName && IdName) {
    const m = IdName.cdata.match(/<anon type="name" n=(.+?)\/>/);
    const nameId = m[1] || '';
    const example = `<anon type="name"/> & <anon type="name" n="${nameId}"/>`;
    return [['anonNameId', reportFileName, example]];
  }
  return false;
};

const checkFirstWho = ({ u, reportFileName }) => {
  const { att_who, cdata } = u[0];
  if (att_who !== 'P1') {
    const example = `<u who="${att_who}" n="1">${cdata}</u>`
    return [['firstWho', reportFileName, example]];
  }
  return false;
};

const sExtraLog = ({ obj, reportFileName }) => {
  const { u } = obj.SJML.text;
  let extraLog = [];
  const sideChar = checkSideChar({ u, reportFileName });
  extraLog = sideChar ? [...extraLog, ...sideChar] : extraLog;
  const innerSpace = checkInnerSpace({ u, reportFileName });
  extraLog = innerSpace ? [...extraLog, ...innerSpace] : extraLog;
  const anonNameId = checkAnon({ u, reportFileName });
  extraLog = anonNameId ? [...extraLog, ...anonNameId] : extraLog;
  const firstWho = checkFirstWho({ u, reportFileName });
  extraLog = firstWho ? [...extraLog, ...firstWho] : extraLog;

  return extraLog;
}

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
    validLog = [reportFileName, plusIndex(dataPath), message]
    passValid = false;
  } 
  if (['SXRW', 'SDRW'].includes(schemaType)) {
    const orderErrorIdx = obj.SJML.text.u
      .findIndex((elem, index) => elem.att_n !== `${index + 1}`);
    if (orderErrorIdx > -1) {
      validLog = [
        reportFileName,
        plusIndex(`/SJML/text/u/${orderErrorIdx}/att_n`),
        'should match with .u order'
      ]
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