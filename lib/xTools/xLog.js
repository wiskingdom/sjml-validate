const fs = require('fs');
const path = require('path');

const serialize = arr => arr.join('\n').replace(/[\n\r]+/g, '\n').trim();
const xLog = ({ outputFolder, runType, schemaType, report }) => {
  const parseLogPath = path.join(outputFolder, `errLog_${runType}_${schemaType}.txt`);
  const validLogPath = path.join(outputFolder, `validLog_${runType}_${schemaType}.txt`);
  const tokenSizePath = path.join(outputFolder, `tokenSize_${runType}_${schemaType}.txt`);
  const processPath = path.join(outputFolder, `process_${runType}_${schemaType}.txt`);
  fs.mkdirSync(outputFolder, { recursive: true });
  fs.writeFileSync(parseLogPath, serialize(report.parseLog));
  fs.writeFileSync(validLogPath, serialize(report.validLog));
  fs.writeFileSync(tokenSizePath, report.tokenSizeResult.join('\n'));
  fs.writeFileSync(processPath, report.processResult.join('\n'));
};

module.exports = { xLog };