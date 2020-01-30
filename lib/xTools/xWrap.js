const path = require('path');
const xWrap = ({ runType, inputFilePath, schemaType }) => ({
  runType,
  inputFilePath,
  inputFileName: path.parse(inputFilePath).base,
  schemaType,
  passEncoding: false,
  inputXml: '',
  passParse: false,
  parseLog: '',
  obj: {},
  passValid: false,
  validLog: '',
  tokenSize: 0,
  outputXml: '',
  outputFileName: ''
  });

module.exports = { xWrap };