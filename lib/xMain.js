// run with input paths & write result and report file
const fs = require('fs');
const path = require('path');
const { xRun, xLog } = require('./xTools');

// functions
const getPassFail = bool => bool ? 'pass' : 'fail';

const xMain = ({ runType, schemaType, inputFolder, extFilter, outputFolder }) => {
  const fileNames = fs.readdirSync(inputFolder)
    .filter(fileName => path.extname(fileName) === `.${extFilter}`);
  
  const report = {
    parseLog: [],
    validLog: [],
    processResult: [],
    tokenSizeResult: []
  }
  const date = Date.now();
  const resultFolder = path.join(outputFolder, `result_convert_${schemaType}_${date}`);
  fs.mkdirSync(resultFolder, { recursive: true });

  fileNames.forEach(fileName => {
    const inputFilePath = path.join(inputFolder, fileName);
    const {
      passEncoding,
      passParse,
      passValid,
      parseLog,
      validLog,
      tokenSize,
      outputFileName,
      outputXml,
    } = xRun({ runType, schemaType, inputFilePath, outputFolder });
    const resultFileName = outputFileName || fileName;
    const tokenSizeResult = [resultFileName, tokenSize].join('\t');
    const processResult = `${resultFileName}\t` + [passEncoding, passParse, passValid]
      .map(getPassFail).join('\t');

    report.tokenSizeResult.push(tokenSizeResult);
    report.processResult.push(processResult);
    report.parseLog.push(parseLog);
    report.validLog.push(validLog);

    if (parseLog) console.log(parseLog);
    if (validLog) console.log(validLog);
    
    if (runType === 'convert') {
      
      const resultFilePath = path
        .join(resultFolder, `${path.parse(resultFileName).name}.sjml`);
      fs.writeFileSync(resultFilePath, outputXml);
    }
  });
  xLog({ outputFolder, runType, schemaType, report, date });
}

module.exports = { xMain };