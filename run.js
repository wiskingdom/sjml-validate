const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'SXRW';
const extFilter = 'sjml';
const runType = 'validate';
const inputFolder = path
  .normalize('C:\\Users\\yeon\\Desktop\\sample\\SXRW');
const outputFolder = path
  .normalize('C:\\Users\\yeon\\Desktop\\output');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
