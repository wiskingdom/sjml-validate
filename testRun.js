const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'EXRW';
const extFilter = 'sjml';
const runType = 'validate';

const inputFolder = path
  .normalize('sample/EXRW');
const outputFolder = path
  .normalize('output/EXRW');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
