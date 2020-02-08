//const { xTab } = require('./xTab.js');
const { xWrap } = require('./xWrap.js');
const { xRead } = require('./xRead.js');
const { xEscape } = require('./xEscape.js');
const { xParse } = require('./xParse.js');
const { xConvert } = require('./xConvert.js');
const { xValidate } = require('./xValidate.js');
const { xGetTokenSize } = require('./xGetTokenSize.js');
const { toXml } = require('./toXml.js');
const { xLog } = require('./xLog.js');

const xRunConvert = (payload) => {
  const pipeline = [
    xWrap,
    xRead,
    xEscape,
    xParse,
    xConvert,
    xValidate,
    xGetTokenSize,
    toXml
  ];
  const result = pipeline
    .reduce((data, f) => f(data), payload);
  return result;
};
const xRunValidate = (payload)  => {
  const pipeline = [
    xWrap,
    xRead,
    xParse,
    xValidate,
    xGetTokenSize,
  ];
  const result = pipeline
    .reduce((data, f) => f(data), payload);
  return result;
};

const xRun = ({ runType, schemaType, inputFilePath }) => {
  const run = {
    convert: xRunConvert,
    validate: xRunValidate,
  };
  return run[runType]({ runType, schemaType, inputFilePath });
};

module.exports = { xRun, xLog, xEscape };
