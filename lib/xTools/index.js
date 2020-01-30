//const { xTab } = require('./xTab.js');
const { xWrap } = require('./xWrap.js');
const { xEscape } = require('./xEscape.js');
const { xParse } = require('./xParse.js');
const { xConvert } = require('./xConvert.js');
const { xValidate } = require('./xValidate.js');
const { xGetTokenSize } = require('./xGetTokenSize.js');
const { toXml } = require('./toXml.js');

const getPassFail = bool => bool ? 'pass' : 'fail';

const xRunConvert = schemaType => filePath => sourceXml => {
  const pipeline = [
    xWrap, // common
    xEscape, // WXOR, WCOR
    xParse, // common
    xValidate, // common
    xConvert, // common
    xGetTokenSize, // common
    toXml // common
  ];
  const result = pipeline
    .reduce((data, f) => f(data), { filePath, schemaType, sourceXml });
  return result;
};
const xRunValidate = schemaType => filePath => sourceXml => {
  const pipeline = [
    xWrap, // common
    xParse, // common
    xValidate, // common
    xGetTokenSize, // common
  ];
  const result = pipeline
    .reduce((data, f) => f(data), { filePath, schemaType, sourceXml });
  return result;
};

module.exports = { xRunConvert, xRunValidate };
