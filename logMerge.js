const fs = require('fs');
const path = require('path');


const reportType = 'errLog'; // tokenSize, errLog
const target = '문어';
const inputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\원문리포트');
const outputFolder = path
  .normalize('C:\\Users\\korean\\Desktop');

const outFileName = path.join(outputFolder,`${target}_${reportType}.txt`)

const fileNames = fs.readdirSync(inputFolder).filter(fileName => fileName.startsWith(reportType));
const merged = [];
fileNames.forEach(fileName => {
    const filePath = path.join(inputFolder , fileName);
    merged.push(fs.readFileSync(filePath, 'utf8').trim());
});

fs.writeFileSync(outFileName, merged.join('\n').replace(/[\n\r]+/g, '\n').trim());