// run with input paths & write result and report file
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { xRun, xLog } = require('./xTools');

// functions
const getPassFail = bool => bool ? 'pass' : 'fail';

const xMain = ({ runType, schemaType, inputFolder, extFilter, outputFolder }) => {
  const inputFilePaths = glob.sync(`${inputFolder}/**/*.${extFilter}`);

  const report = {
    parseLog: [],
    validLog: [],
    processResult: [],
    tokenSizeResult: []
  }
  const date = Date.now();
  const resultFolder = path.join(outputFolder, `result_convert_${schemaType}_${date}`);
  fs.mkdirSync(resultFolder, { recursive: true });

  inputFilePaths.forEach(filePath => {
    const inputFilePath = path.normalize(filePath);
    const inputFileName = path.parse(inputFilePath).base;
        
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

    const resultFileName = outputFileName || inputFileName;
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
      const inputFolderDep = inputFolder.split(path.sep).length;
      const middles = path.normalize(inputFilePath)
        .split(path.sep).slice(inputFolderDep, -1);
      const middlePath = path.join(...middles);

      fs.mkdirSync(path.join(resultFolder, middlePath), { recursive: true });
      const resultFilePath = path
        .join(resultFolder, middlePath, outputFileName);
      fs.writeFileSync(resultFilePath, outputXml);
    }
  });
  xLog({ outputFolder, runType, schemaType, report, date });
}

module.exports = { xMain };