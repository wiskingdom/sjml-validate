const fs = require('fs');
const chardet = require('chardet');

const xRead = container => {
  const { inputFilePath } = container;
  const encoding = chardet.detectFileSync(inputFilePath, { sampleSize: 256 });
  if (encoding === 'EUC-KR') {
    return { ...container, inputXml: '' }
  }
  const inputXml = fs.readFileSync(inputFilePath, 'utf8');
  return { ...container, inputXml, passEncoding: true };
};

module.exports = { xRead };