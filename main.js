const fs = require('fs');
const path = require('path');
const { xValidate } = require('./lib/xTools.js');

//options
// souceType: wr:원문, wm:원문-잡지, wn:뉴스, ww:웹, sd:일상대화, ss:구어
const sourceType = 'wnn';
const extention = '.sjml';
const inputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\검증기사자료\\corpus');
const outputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\검증기사자료re\\corpus');
const parentFolder = path.join(...outputFolder.split(path.sep).slice(0, -1));
const folderName = inputFolder.split(path.sep).reverse()[0];
const errLogPath = path.join(parentFolder, `errLog_${folderName}.txt`);
const validLogPath = path.join(parentFolder, `validLog_${folderName}.txt`);
const tokenSizePath = path.join(parentFolder, `tokenSize_${folderName}.txt`);

const fileNames = fs.readdirSync(inputFolder).filter(fileName => fileName.endsWith(extention));
const report = {
  errLog: [],
  validLog: [],
  tokenSize: []
}

fileNames.forEach(fileName => {
  const filePath = path.join(inputFolder, fileName);
  const xmlPath = path.join(outputFolder, fileName.replace(extention, '.sjml'));
  const result = xValidate(sourceType)(filePath);
  fs.writeFileSync(xmlPath, result.xml);
  report.errLog.push(result.errLog.join('\n'));
  report.validLog.push(result.validLog.join('\n'));
  report.tokenSize.push(result.tokenSize);
});

const serialize = arr => arr.join('\n').replace(/[\n\r]+/g, '\n').trim();

fs.writeFileSync(errLogPath, serialize(report.errLog));
fs.writeFileSync(validLogPath, serialize(report.validLog));
fs.writeFileSync(tokenSizePath, report.tokenSize.join('\n'));

