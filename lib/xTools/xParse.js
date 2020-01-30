const xToJ = require('fast-xml-parser');

const parseOptions = {
  ignoreAttributes : false
};

const xParse = container => {
  const { fileName, schemaType, sourceXml } = container;
  let obj = {};
  let parseLog = ''
  let passParse = true;

  try {
    obj = xToJ.parse(sourceXml, parseOptions, true);
    if (['wr', 'wm'].includes(schemaType)) {
      if (!obj['SJML']['text']['p']) {
        const p = obj['SJML']['text'].split(/[\n\r]+/)
        .map(str => str.replace(/ +/g, ' ').trim());
        obj['SJML']['text'] = { p };
      }
    }
  } catch (error) {
    parseLog = (`${fileName}\t${error.message}`);
    passParse = false;
  }

  return { ...container, obj, passParse, parseLog };
}

module.exports = { xParse };