const fs = require('fs');
const path = require('path');
const { xRunConvert } = require('./lib/xTools');

//options
// souceType: wr:원문, wm:원문-잡지, wn:뉴스, ww:웹, sd:일상대화, ss:구어
const schemaType = 'wr';
const extention = '.sjml';
const inputFolder = path
  .normalize('sample/WXOR');
const outputFolder = path
  .normalize('output/WXOR');
const parentFolder = path.join(...outputFolder.split(path.sep).slice(0, -1));
const folderName = inputFolder.split(path.sep).reverse()[0];
const errLogPath = path.join(parentFolder, `errLog_${folderName}.txt`);
const validLogPath = path.join(parentFolder, `validLog_${folderName}.txt`);
const tokenSizePath = path.join(parentFolder, `tokenSize_${folderName}.txt`);

const fileNames = fs.readdirSync(inputFolder).filter(fileName => fileName.endsWith(extention));
const report = {
  parseLog: [],
  validLog: [],
  tokenSizeLog: []
}

fileNames.forEach(fileName => {
  const filePath = path.join(inputFolder, fileName);
  const xmlPath = path.join(outputFolder, fileName.replace(extention, '.sjml'));
  const sourceXml = fs.readFileSync(filePath, 'utf8');
  const result = xRunConvert(schemaType)(filePath)(sourceXml);
  fs.writeFileSync(xmlPath, result.targetXml);
  if (result.parseLog) console.log(result.parseLog);
  if (result.validLog) console.log(result.validLog);
  report.parseLog.push(result.parseLog);
  report.validLog.push(result.validLog);
  report.tokenSizeLog.push(result.tokenSizeLog);
});

const serialize = arr => arr.join('\n').replace(/[\n\r]+/g, '\n').trim();

fs.writeFileSync(errLogPath, serialize(report.parseLog));
fs.writeFileSync(validLogPath, serialize(report.validLog));
fs.writeFileSync(tokenSizePath, report.tokenSizeLog.join('\n'));

