const path = require('path');
const { xMain } = require('./lib/xMain.js');

// options
// souceType: WXRW:문어, WCRW:문어-잡지, NXRW:뉴스
const schemaType = 'SXRW';
const extFilter = 'sjml';
const runType = 'convert';
const inputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\20190207\\구어');
const outputFolder = path
  .normalize('C:\\Users\\korean\\Desktop\\output');

// main
xMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
