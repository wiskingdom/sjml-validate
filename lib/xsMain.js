// import modules
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const { xRun } = require('./xFuncs');
const { xsLog } = require('./xsLog');

// def functions
const getPassFail = bool => bool ? 'pass' : 'fail';

// main function
const xsMain = runOptions => {
  const { runType,
    schemaType,
    inputFolder,
    extFilter,
    outputFolder
  } = runOptions;
  const inputFilePaths = glob.sync(`${inputFolder}/**/*.${extFilter}`);
  if (inputFilePaths.length === 0) {
    console.log(chalk.yellowBright(`no ${extFilter} file in the input folder`));
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

    const firstParseLog = parseLog[0] ? [parseLog[0]] : [];
    const firstValidLog = validLog[0] ? [validLog[0]] : [];

    report.parseLog = [...report.parseLog, ...firstParseLog];
    report.validLog = [...report.validLog, ...firstValidLog];
    report.extraLog = [...report.extraLog, ...extraLog];
    
    let filePathMap = [inputFileName, '', inputFilePath, ''];

    if (parseLog[0]) {
      console.error(chalk.redBright(parseLog[0].slice(0, -1).join('\t')));
    } else {
      console.log(inputFileName)
    }
    
        
    if (runType === 'convert' && passParse) {
      const inputFolderDep = inputFolder.split(path.sep).length;
      const middles = path.normalize(inputFilePath)
        .split(path.sep).slice(inputFolderDep, -1);
      const middlePath = path.join(...middles);

      fs.mkdirSync(path.join(resultFolder, middlePath), { recursive: true });
      const resultFilePath = path
        .join(resultFolder, middlePath, outputFileName);
      fs.writeFileSync(resultFilePath, outputXml);
      filePathMap = [filePathMap[0], outputFileName, filePathMap[2], resultFilePath]
    }

    report.filePathMap = [...report.filePathMap, filePathMap];

    const parseAll = `parseLogAll_${runType}_${schemaType}_${date}.txt`;
    const validAll = `validLogAll_${runType}_${schemaType}_${date}.txt`;
    
    fs.mkdirSync(outputFolder, { recursive: true });
    if (parseLog.length) {
      fs.appendFileSync(
        path.join(outputFolder, parseAll),
        parseLog.map(row => row.join('\t')).join('\n') + '\n',
        'utf8'
      );
    }
    if (validLog.length) {
      fs.appendFileSync(
        path.join(outputFolder, validAll),
        validLog.map(row => row.join('\t')).join('\n') + '\n',
        'utf8'
      );
    }
  });
  xsLog({ outputFolder, runType, schemaType, report, date });
}

// export module
module.exports = { xsMain };
