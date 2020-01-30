//const { xTab } = require('./xTab.js');
const { xWrap } = require('./xWrap.js');
const { xEscape } = require('./xEscape.js');
const { xParse } = require('./xParse.js');
const { xConvert } = require('./xConvert.js');
const { xValidate } = require('./xValidate.js');
const { xGetTokenSize } = require('./xGetTokenSize.js');
const { toXml } = require('./toXml.js');

const getPassFail = bool => bool ? 'pass' : 'fail';
// const xRunMutate
const xRunConvert = schemaType => filePath => sourceXml => {
  const pipeline = [
    xWrap, // common
    xEscape, // only WXOR, WCOR
    xParse, // common
    xConvert, // case
    xValidate, // common
    xGetTokenSize, // case
    toXml // case
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
    xGetTokenSize, // case
  ];
  const result = pipeline
    .reduce((data, f) => f(data), { filePath, schemaType, sourceXml });
  return result;
};

module.exports = { xRunConvert, xRunValidate };
