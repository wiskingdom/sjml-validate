const path = require('path');
const { xMain } = require('./lib/xMain.js');

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스
const schemaType = 'SDRW';
const extFilter = 'xml';
const runType = 'validate';
const inputFolder = path
  .normalize('sample/SDRW');
const outputFolder = path
  .normalize('output');

// main
xMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
