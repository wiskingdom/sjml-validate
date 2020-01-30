const fs = require('fs');
const path = require('path');
const { xRun, xLog } = require('./lib/xTools');

// functions
const getPassFail = bool => bool ? 'pass' : 'fail';

const main = ({ runType, schemaType, inputFolder, extFilter, outputFolder}) => {
  const fileNames = fs.readdirSync(inputFolder)
    .filter(fileName => fileName.endsWith(extFilter));
  const report = {
    parseLog: [],
    validLog: [],
    processResult: [],
    tokenSizeResult: []
  }

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
    const processResult = [passEncoding, passParse, passValid]
      .map(getPassFail).join('\t');

    report.tokenSizeResult.push(tokenSizeResult);
    report.processResult.push(processResult);
    report.parseLog.push(parseLog);
    report.validLog.push(validLog);

    if (parseLog) console.log(parseLog);
    if (validLog) console.log(validLog);
    if (runType === 'convert') {
      const resultFolder = path.join(outputFolder, schemaType);
      const resultFilePath = path
        .join(resultFolder, `${path.parse(resultFileName).name}.sjml`);
      fs.mkdirSync(resultFolder, { recursive: true });
      fs.writeFileSync(resultFilePath, outputXml);
    }
  });
  xLog({ outputFolder, runType, schemaType, report });
}

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스, ww:웹, sd:일상대화, ss:구어
const schemaType = 'WXRW';
const extFilter = '.sjml';
const runType = 'convert';
const inputFolder = path
  .normalize('sample/WXRW');
const outputFolder = path
  .normalize('output');

// main
main({ runType, schemaType, inputFolder, extFilter, outputFolder });
