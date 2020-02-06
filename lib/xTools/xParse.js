const xToJ = require('fast-xml-parser');

const parseOptions = {
  ignoreAttributes : false,
  parseNodeValue : false
};

const xParse = container => {
  const { inputFileName, schemaType, inputXml, passEncoding } = container;
  if (!passEncoding) {
    return container;
  }
  let obj = {};
  let parseLog = ''
  let passParse = true;

  try {
    obj = xToJ.parse(inputXml, parseOptions, true);
    if (['WXRW', 'WCRW'].includes(schemaType)) {
      if (!obj['SJML']['text']['p']) {
        const p = obj['SJML']['text'].split(/[\n\r]+/)
        .map(str => str.replace(/ +/g, ' ').trim());
        obj['SJML']['text'] = { p };
      }
    }
  } catch (error) {
    parseLog = (`${inputFileName}\t${error.message}`);
    passParse = false;
  }

  return { ...container, obj, passParse, parseLog };
}

module.exports = { xParse };