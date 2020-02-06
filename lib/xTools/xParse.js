const xToJ = require('fast-xml-parser');

const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false
};

const xParse = container => {
  const { inputFileName, inputXml, passEncoding } = container;
  if (!passEncoding) {
    return container;
  }
  let obj = {};
  let parseLog = ''
  let passParse = true;

  try {
    obj = xToJ.parse(inputXml, parseOptions, true);

  } catch (error) {
    parseLog = (`${inputFileName}\t${error.message}`);
    passParse = false;
  }

  return { ...container, obj, passParse, parseLog };
}

module.exports = { xParse };