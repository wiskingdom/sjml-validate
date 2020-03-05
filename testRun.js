const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'SDRW';
const extFilter = 'SJML';
const runType = 'validate';

const inputFolder = path
  .normalize('sample/SDRW');
const outputFolder = path
  .normalize('output/SDRW');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
