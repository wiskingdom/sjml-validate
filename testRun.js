const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'EXRW';
const extFilter = 'sjml';
const runType = 'validate';
// C:\\Users\\korean\\Desktop\\EXRW
//C:\\Users\\korean\\Desktop\\데이터\\웹
const inputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\데이터\\웹');
const outputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\output');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });