const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dropEmpty = arr => arr.filter(item => !!item[0]);
const toXLSX = report => {
  const {
    parseLog,
    validLog,
    extraLog,
    tokenSizeResult,
    processResult,
    filePathMap
  } = report;
  const pLogHeader = ['fileName', 'log']; 
  const vLogHeader = ['fileName', 'location', 'log'];
  const tResultHeader = ['fileName', 'tokenSize'];
  const prResultHeader = ['fileName', 'encoding', 'parsing', 'validating'];
  const pathHeader = ['inputFileName', 'resultFileName', 'inputFilePath'];
  
  const wb = XLSX.utils.book_new();
  const pLogSheet = XLSX.utils.aoa_to_sheet([pLogHeader, ...dropEmpty(parseLog)]);
  const vLogSheet = XLSX.utils.aoa_to_sheet([vLogHeader, ...dropEmpty(validLog)]);
  const tResultSheet = XLSX.utils.aoa_to_sheet([tResultHeader, ...tokenSizeResult]);
  const prResultSheet = XLSX.utils.aoa_to_sheet([prResultHeader, ...processResult]);
  const pathSheet = XLSX.utils.aoa_to_sheet([pathHeader, ...filePathMap]);

  XLSX.utils.book_append_sheet(wb, pathSheet, 'pathMap');
  XLSX.utils.book_append_sheet(wb, prResultSheet, 'process');
  XLSX.utils.book_append_sheet(wb, pLogSheet, 'parseLog');
  XLSX.utils.book_append_sheet(wb, vLogSheet, 'validLog');
  XLSX.utils.book_append_sheet(wb, tResultSheet, 'tokenSize');

  // extra log
  if (extraLog[0]) {
    const classified = extraLog.reduce((acc, curr) => {
      acc[curr[0]] = acc[curr[0]] || [];
      acc[curr[0]].push(curr.slice(1));
      return acc;
    }, {});
    const extraHeader = ['fileName', 'anExmaple'];
    Object.entries(classified).forEach(([logName, log]) => {
      const sheet = XLSX.utils.aoa_to_sheet([extraHeader, ...log])
      XLSX.utils.book_append_sheet(wb, sheet, logName);
    });
    
  }
  return wb;
};

const xLog = ({ outputFolder, runType, schemaType, report, date }) => {
  fs.mkdirSync(outputFolder, { recursive: true });
  const wb = toXLSX(report);
  const reportFileName = `report_${runType}_${schemaType}_${date}.xlsx`;
  XLSX.writeFile(wb, path.join(outputFolder, reportFileName));
  
};

module.exports = { xLog };
