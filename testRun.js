const path = require('path');
const { xsMain } = require('./lib/xsMain.js');

// options
const schemaType = 'NXRW';
const extFilter = 'xml';
const runType = 'convert';

const inputFolder = path
  .normalize('sample/NXOR');
const outputFolder = path
  .normalize('output/NXRW');

// main
xsMain({ runType, schemaType, inputFolder, extFilter, outputFolder });
