//const { xTab } = require('./xTab.js');
const { xWrap } = require('./xWrap.js');
const { xRead } = require('./xRead.js');
const { xEscape } = require('./xEscape.js');
const { xParse } = require('./xParse.js');
const { xConvert } = require('./xConvert.js');
const { xValidate } = require('./xValidate.js');
const { xCheck } = require('./xCheck.js');
const { xGetTokenSize } = require('./xGetTokenSize.js');
const { toXml } = require('./toXml.js');

const xRunConvert = options => {
  const pipeline = [
    xWrap,
    xRead,
    xEscape,
    xParse,
    xConvert,
    xValidate,
    xCheck,
    xGetTokenSize,
    toXml
  ];
  const result = pipeline
    .reduce((data, f) => f(data), options);
  return result;
};
const xRunValidate = options  => {
  const pipeline = [
    xWrap,
    xRead,
    xParse,
    xValidate,
    xCheck,
    xGetTokenSize,
  ];
  const result = pipeline
    .reduce((data, f) => f(data), options);
  return result;
};

const xRunValidateEsc = options  => {
  const pipeline = [
    xWrap,
    xRead,
    xEscape,
    xParse,
    xValidate,
    xCheck,
    xGetTokenSize,
  ];
  const result = pipeline
    .reduce((data, f) => f(data), options);
  return result;
};

const xRun = ({ runType, schemaType, inputFilePath }) => {
  const run = {
    convert: xRunConvert,
    validate: xRunValidate,
    validateEsc: xRunValidateEsc,
  };
  return run[runType]({ runType, schemaType, inputFilePath });
};

module.exports = { xRun };
