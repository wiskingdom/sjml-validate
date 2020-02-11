// run with input paths & write result and report file
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { xRun } = require('./xFuncs');
const { xsLog } = require('./xsLog');

// functions
const getPassFail = bool => bool ? 'pass' : 'fail';

const xsMain = runOptions => {
  const { runType,
    schemaType,
    logAll,
    inputFolder,
    extFilter,
    outputFolder
  } = runOptions;
  const inputFilePaths = glob.sync(`${inputFolder}/**/*.${extFilter}`);
  if (inputFilePaths.length === 0) {
    console.log(`no ${extFilter} file in input folder`);
  }

  const report = {
    parseLog: [],
    validLog: [],
    extraLog: [],
    processResult: [],
    tokenSizeResult: [],
    filePathMap: [],
  }
  const date = Date.now();
  const resultFolder = path
    .join(outputFolder, `result_convert_${schemaType}_${date}`);
  if (runType === 'convert') fs.mkdirSync(resultFolder, { recursive: true });
  
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
      extraLog,
    } = xRun({ runType, schemaType, inputFilePath, outputFolder });

    const resultFileName = outputFileName || inputFileName;
    const tokenSizeResult = [resultFileName, tokenSize];
    const processResult = [
      resultFileName, 
      ...[passEncoding, passParse, passValid].map(getPassFail)
    ];

    report.tokenSizeResult = [
      ...report.tokenSizeResult, 
      tokenSizeResult
    ];
    report.processResult = [
      ...report.processResult, 
      processResult
    ];

    report.parseLog = [...report.parseLog, ...parseLog];
    report.validLog = [...report.validLog, ...validLog];
    report.extraLog = [...report.extraLog, ...extraLog];
    
    const filePathMap = [inputFileName, resultFileName, inputFilePath];
    report.filePathMap = [...report.filePathMap, filePathMap];

    if (parseLog[0]) console.error(parseLog.join('\t'));
        
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
  xsLog({ outputFolder, runType, schemaType, report, date });
}

module.exports = { xsMain };