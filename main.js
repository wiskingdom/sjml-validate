const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스
const schemaType = 'SDRW';
const extFilter = 'SJML';
const runType = 'validate';
const logAll = true // 
const inputFolder = path
  .normalize('C:\\Users\\yeon\\Desktop\\sample\\SDRW');
const outputFolder = path
  .normalize('C:\\Users\\yeon\\Desktop\\output');

// main
xsMain({ runType, schemaType, logAll, inputFolder, extFilter, outputFolder });
