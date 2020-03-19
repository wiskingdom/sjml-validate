const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'SERW';
const extFilter = 'sjml';
const runType = 'validate';

const inputFolder = path
  .normalize('sample/serw_e');
const outputFolder = path
  .normalize('output/serw_e');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
