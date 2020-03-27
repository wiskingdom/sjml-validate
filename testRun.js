const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'SERW';
const extFilter = 'sjml';
const runType = 'validate';

const inputFolder = path
  .normalize('sample/SERW');
const outputFolder = path
  .normalize('output/SERW');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
