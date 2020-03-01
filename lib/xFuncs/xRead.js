// import modules
const fs = require('fs');
const chardet = require('chardet');

// main function 
const xRead = container => {
  const { inputFilePath } = container;
  const encoding = chardet.detectFileSync(inputFilePath, { sampleSize: 256 });
  const passEncoding = encoding === 'UTF-8';
  const inputXml = fs.readFileSync(inputFilePath, 'utf8');
  return { ...container, inputXml, passEncoding };
};

// export module
module.exports = { xRead };
