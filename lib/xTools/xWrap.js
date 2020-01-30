const path = require('path');
const xWrap = ({ filePath, schemaType, sourceXml }) => ({
  filePath,
  fileName: path.parse(filePath).base,
  schemaType,
  sourceXml,
  parseLog: '',
  obj: {},
  validLog: '',
  tokenSize: 0,
  tokenSizeLog: '',
  targetXml: ''
  });

module.exports = { xWrap };