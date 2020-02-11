#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const { xsMain } = require('../lib/xsMain.js');

const lf = '\t\t\t      '
const blf = lf + '  - '

program
  .option('-s, --schema <Type>', `set an schema type
    ${blf}WXRW: 문어
    ${blf}WCRW: 문어(잡지)
    ${blf}NXRW: 신문
    ${blf}EXRW: 웹
    ${blf}SXRW: 구어(공적독백, 공적대화)
    ${blf}SDRW: 구어(일상대화)
    ${blf}SERW: 준구어(대본)
    ${blf}SFRW: 준구어(연설)`)
  .option('-i, --input <dir_path>', 'set a dir path has input files (required)')
  .option('-e, --ext [ext_name]', `set a extention name of target input files
    ${lf}  (default: sjml)`)
  .option('-o, --output [dir_path]', `set a dir path for validation reports
    ${lf}  (default: ./output/)`)
  .option('-w, --withEsc', `run parser with escaping
    ${lf}  (default: without escaping`)
  .parse(process.argv);

const types = [
  'WXRW',
  'WCRW',
  'NXRW',
  'SXRW',
  'SDRW',
  'SERW',
  'SFRW',
  'EXRW',
];

if (!program.input) {
  program.input = '';
  console.error(chalk.yellowBright('Error: option \'-i, --input\' is required'));
  console.log(chalk.yellowBright('usage info can be viewed via: sjmlv --help'));
  process.exit();
} 
if (!program.schema) {
  program.key = '';
  console.error(chalk.yellowBright('Error: option \'-s, --schema\' is required'));
  console.log(chalk.yellowBright('usage info can be viewed via: sjmlv --help'));
  process.exit();
} 
if (!fs.existsSync(program.input)) {
  console.error(chalk.yellowBright(`no such directory: \'${program.input}\'`));
  process.exit();  
} 
if (!types.includes(program.schema)) {
  console.error(chalk.yellowBright(`invalid type: \'${program.schema}\'`));
  process.exit();  
}

if (!program.output) {
  program.output = './output/';
}
if (!program.ext) {
  program.ext = 'sjml';
}
if (!program.ext) {
  program.withEsc = false;
}

const { schema, input, ext, output, withEsc } = program;

const runType = withEsc ? 'validateEsc' : 'validate';
const schemaType = schema;
const inputFolder = path.normalize(input);
const extFilter = ext;
const outputFolder = path.normalize(output);

//main
xsMain({
  runType,
  schemaType,
  inputFolder,
  extFilter,
  outputFolder
});
try {

  
} catch (e) {
  console.error(chalk.yellowBright(e.message));
  console.log(chalk.yellowBright('usage info can be viewed via: sjmlv --help'));
}



/*
console.log({
  runType,
  schemaType,
  inputFolder,
  extFilter,
  outputFolder
});
*/