const path = require('path');
const { xMain } = require('./lib/xMain.js');

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스
const schemaType = 'SDRW';
const extFilter = 'SJML';
const runType = 'convert';
const inputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\일상대화');
const outputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\output');

// main
xMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
