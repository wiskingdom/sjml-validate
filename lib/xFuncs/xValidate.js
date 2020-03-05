// import modules
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: true});
require('ajv-errors')(ajv /*, {singleError: true} */);

// def functions
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

const getInValidByPath = location => obj => {
  const joinLocParts = locParts => `[\'${locParts.join('\'][\'')}\']`;
  const locParts = location.split('/').slice(1);
  const pathObj = joinLocParts(locParts);
  const get = pathObj => new Function('obj', `return obj${pathObj};`);

  try {
    const value = get(pathObj)(obj);
    if (typeof value === 'string') {
      const markedValue = value
        .replace(/\n/g, '<LF>')
        .replace(/\r/g, '<CR>')
        .replace(/\t/g, '<TAB>')
        .replace(/\s\s+/g, '<SS+>')
        .replace(/^\s|\s$/g, '<S>');
      return `"${markedValue}"`;
    }
    
    return ``;
  } catch {
    return '';
  }
};

const getHintByPath = schemaType => location => obj => {
  if (!['SERW', 'EXRW'].includes(schemaType)) {
    return '';
  }
  const joinLocParts = locParts => `[\'${locParts.join('\'][\'')}\']`;
  const locParts = location.split('/').slice(1);
  const get = pathObj => new Function('obj', `return obj${pathObj}`);

  try {
    let hints = [];
    if (schemaType === 'SERW') {
      if (location.match(/episode\/\d+/)) {
        const hintPath = [...locParts.slice(0, 4), 'att_n' ];
        const hint = get(joinLocParts(hintPath))(obj);
        hints.push(`<episode n="${hint}">`)
      } 
      if (location.match(/scene\/\d+/)) {
        const hintPath = [...locParts.slice(0, 6), 'att_n' ];
        const hint = get(joinLocParts(hintPath))(obj);
        hints.push(`<scene n="${hint}">`)
      }
    } else if (schemaType === 'EXRW') {
      if (location.match(/SJML\/\d+/)) {
        const hintPath = [...locParts.slice(0, 3), 'header', 'sourceInfo', 'title'];
        const hint = get(joinLocParts(hintPath))(obj);
        hints.push(`in SJML which has <title>${hint}</title>`)
      } 
    }

    return `${hints.join(' ')}`.replace(/[\n\r]+/g, ' ').trim();

  } catch {
    return '';
  }
};

const personInterWho = ({ obj, reportFileName }) => {
  const personIds = obj.SJML.header.profileInfo.personId.map(elem => elem['#text']);
  const whos = obj.SJML.text.u.map(elem => elem.att_who);
  const whoSet = [...new Set(whos)];
  const hasU = whoSet => personId => whoSet.some(elem => elem.includes(personId));

  const silentPerson = personIds.reduce((acc, curr, index) => {
    if (!hasU(whoSet)(curr)) {
      const silentPersonLog = [
        reportFileName,
        plusIndex(`/SJML/header/profileInfo/personId/${index}/#text`),
        `should NOT have any silent person: ${curr}`,
        getInValidByPath(`/SJML/header/profileInfo/personId/${index}/#text`)(obj),
        '',
      ];
      return [...acc, silentPersonLog];
    }
    return acc;
  }, []);

  const hasP = personIds => who => personIds.some(elem => who.includes(elem));

  const unspecifiedWho = whos.reduce((acc, curr, index) => {
    if (!hasP(personIds)(curr) && !['unknown', 'all'].includes(curr)) {
      const unspecifiedWhoLog = [
        reportFileName,
        plusIndex(`/SJML/text/u/${index}/att_who`),
        `should NOT have any unspecified who: ${curr}`,
        getInValidByPath(`/SJML/text/u/${index}/att_who`)(obj),
        '',
      ];
      return [...acc, unspecifiedWhoLog];
    }
    return acc;
  }, []);
  return [...silentPerson, ...unspecifiedWho];
};

const uOrder = ({ obj, reportFileName }) => {
  const orderErrorIdx = obj.SJML.text.u
    .findIndex((elem, index) => elem.att_n !== `${index + 1}`);
  const validLog = orderErrorIdx > -1 ? [
      reportFileName,
      plusIndex(`/SJML/text/u/${orderErrorIdx}/att_n`),
      'should match with .u order',
      getInValidByPath(`/SJML/text/u/${orderErrorIdx}/att_n`)(obj),
      '',
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
  'l',
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
          `should NOT have invalid tag: ${invalidTagName}`,
          getInValidByPath(`/SJML/text/u/${index}/cdata`)(obj),
          '',
        ];
        return [...acc, invalidTagLog];
      }
      return acc;
    }, []);
};

const sAdditional = ({ obj, reportFileName }) => {
  const pipe = [
    uOrder,
    invalidTag(sTagList),
    personInterWho
  ];
  return pipe.reduce((acc, f) => [...acc, ...f({ obj, reportFileName })], []);
};

const mAdditional = ({ obj, reportFileName }) => {
  const pipe = [
    uOrder,
    invalidTag(mTagList),
    personInterWho
  ];
  return pipe.reduce((acc, f) => [...acc, ...f({ obj, reportFileName })], []);
};

const skip = () => [];

// main function 
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
      .map(({ dataPath, message }) => [
        reportFileName, 
        plusIndex(dataPath), 
        message,
        getInValidByPath(dataPath)(obj),
        getHintByPath(schemaType)(dataPath)(obj)
      ]);
    validLog = commonValidLog;
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
    MXRW: mAdditional,
  };

  const addValidateLog = additionalMap[schemaType]({ obj, reportFileName, schemaType});
  validLog = [...validLog, ...addValidateLog];
  const passValid = !validLog.length;

  return { ...container, passValid, validLog };
}

// export module
module.exports = { xValidate };
