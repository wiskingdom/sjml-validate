const path = require('path');
const { xMain } = require('./lib/xMain.js');

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스
const schemaType = 'WXRW';
const extFilter = 'sjml';
const runType = 'convert';
const inputFolder = path
  .normalize('sample/WXRW');
const outputFolder = path
  .normalize('output');

// main
xMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
