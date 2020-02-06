const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dropEmpty = arr => arr.filter(Boolean);
const toTable = arr => arr.map(line => line.split('\t'));
const toXLSX = report => {
  const { parseLog, validLog, tokenSizeResult, processResult } = report;
  const pipe = [toTable, XLSX.utils.aoa_to_sheet];
  const pLogHeader = 'fileName\tlog';
  const vLogHeader = 'fileName\tlocation\tlog';
  const tResultHeader = 'fileName\ttokenSize';
  const prResultHeader = 'fileName\tencoding\tparsing\tvalidating';

  const wb = XLSX.utils.book_new();
  const pLogSheet = pipe
    .reduce((data, f) => f(data), dropEmpty([pLogHeader, ...parseLog]));
  const vLogSheet = pipe
    .reduce((data, f) => f(data), dropEmpty([vLogHeader, ...validLog]));
  const tResultSheet = pipe
    .reduce((data, f) => f(data), [tResultHeader, ...tokenSizeResult]);
  const prResultSheet = pipe
    .reduce((data, f) => f(data), [prResultHeader, ...processResult]);
  XLSX.utils.book_append_sheet(wb, prResultSheet, 'process');
  XLSX.utils.book_append_sheet(wb, pLogSheet, 'parseLog');
  XLSX.utils.book_append_sheet(wb, vLogSheet, 'validLog');
  XLSX.utils.book_append_sheet(wb, tResultSheet, 'tokenSize');
  return wb;
};


const xLog = ({ outputFolder, runType, schemaType, report, date }) => {
  fs.mkdirSync(outputFolder, { recursive: true });
  const wb = toXLSX(report);
  const reportFileName = `report_${runType}_${schemaType}_${date}.xlsx`;
  XLSX.writeFile(wb, path.join(outputFolder, reportFileName));
  
};

module.exports = { xLog };