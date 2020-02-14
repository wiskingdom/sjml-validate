// import modules
const fs = require('fs');
const chardet = require('chardet');

// main function 
const xRead = container => {
  const { inputFilePath } = container;
  const encoding = chardet.detectFileSync(inputFilePath, { sampleSize: 4*1024 });
  if (encoding !== 'UTF-8') {
    return { ...container, inputXml: '' }
  }
  const inputXml = fs.readFileSync(inputFilePath, 'utf8');
  return { ...container, inputXml, passEncoding: true };
};

// export module
module.exports = { xRead };
