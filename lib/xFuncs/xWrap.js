// import modules
const path = require('path');

// main function 
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
  outputFileName: '',
  extraLog: [],
  });

// export module
module.exports = { xWrap };
