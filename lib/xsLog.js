const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const getSingleLogByfile = logList => {
  const SingleLogByfile = logList.reduce((acc, curr) => {
    acc[curr[0]] = acc[curr[0]] || curr;
    return acc;
  }, {});
  return Object.values(SingleLogByfile);
}; 
const toXLSX = ({ runType, report }) => {
  const {
    parseLog,
    validLog,
    extraLog,
    tokenSizeResult,
    processResult,
    filePathMap
  } = report;
  const pLogHeader = ['fileName', 'line', 'type', 'log']; 
  const vLogHeader = ['fileName', 'location', 'log'];
  const tResultHeader = ['fileName', 'tokenSize'];
  const prResultHeader = ['fileName', 'encoding', 'parsing', 'validating'];
  const pathHeader = runType === 'convert'
    ? ['inputFileName', 'inputFilePath', 'resultFileName', 'resultFilePath']
    : ['inputFileName', 'inputFilePath'];
  
  const wb = XLSX.utils.book_new();
  const pLogSheet = XLSX.utils.aoa_to_sheet([pLogHeader, ...parseLog]);
  const validLogSingle = getSingleLogByfile(validLog);
  const vLogSheet = XLSX.utils.aoa_to_sheet([vLogHeader, ...validLogSingle]);
  const tResultSheet = XLSX.utils.aoa_to_sheet([tResultHeader, ...tokenSizeResult]);
  const prResultSheet = XLSX.utils.aoa_to_sheet([prResultHeader, ...processResult]);
  const pathSheet = XLSX.utils.aoa_to_sheet([pathHeader, ...filePathMap]);

  XLSX.utils.book_append_sheet(wb, prResultSheet, 'process');
  XLSX.utils.book_append_sheet(wb, pathSheet, 'pathMap');
  XLSX.utils.book_append_sheet(wb, pLogSheet, 'parseLog');
  XLSX.utils.book_append_sheet(wb, vLogSheet, 'validLog');
  XLSX.utils.book_append_sheet(wb, tResultSheet, 'tokenSize');

  // extra log
  if (extraLog[0]) {
    const classified = extraLog.reduce((acc, curr) => {
      acc[curr[1]] = acc[curr[1]] || [];
      acc[curr[1]].push(curr);
      return acc;
    }, {});
    const extraHeader = ['fileName', 'label', 'anExmaple'];
    const compare = (a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
    Object.entries(classified)
      .sort(compare)
      .forEach(([logName, log]) => {
        const sheet = XLSX.utils.aoa_to_sheet([extraHeader, ...getSingleLogByfile(log)])
        XLSX.utils.book_append_sheet(wb, sheet, logName.slice(0, 3));
      });
    
  }
  return wb;
};

const xsLog = ({ outputFolder, runType, schemaType, report, date }) => {
  fs.mkdirSync(outputFolder, { recursive: true });
  const wb = toXLSX({ runType, report });
  const reportFileName = `report_${runType}_${schemaType}_${date}.xlsx`;
  const validAll = `validAll_${runType}_${schemaType}_${date}.txt`;
  const extraAll = `exAll_${runType}_${schemaType}_${date}.txt`;
  XLSX.writeFile(wb, path.join(outputFolder, reportFileName));
  fs.writeFileSync(
    path.join(outputFolder, validAll),
    report.validLog.map(row => row.join('\t')).join('\n'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(outputFolder, extraAll),
    report.extraLog.map(row => row.join('\t')).join('\n'),
    'utf8'
  );
  
};

module.exports = { xsLog };
