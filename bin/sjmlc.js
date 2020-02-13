#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const { xsMain } = require('../lib/xsMain.js');

const lf = ' '.repeat(20)
const blf = lf + '  - '

program
  .option('-s, --schema <type>', `set a schema type (required)
    ${blf}WXRW: 원문->원시 - 문어(상상, 정보, 기타)
    ${blf}WCRW: 원문->원시 - 문어(잡지)
    ${blf}NXRW: 원문->원시 - 신문`)
  .option('-i, --input <path>', 'an input dir path (required)')
  .option('-e, --ext [ext_name]', `an extention name of target input files
    ${lf}  (default: sjml)`)
  .option('-o, --output [path]', `an output dir path
    ${lf}  (default: ./output/)`)
  .parse(process.argv);

const types = [
  'WXRW',
  'WCRW',
  'NXRW',
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

const { schema, input, ext, output } = program;



const runType = 'convert' ;
const schemaType = schema;
const inputFolder = path.normalize(input);
const extFilter = ext;
const outputFolder = path.normalize(output);

xsMain({
  runType,
  schemaType,
  inputFolder,
  extFilter,
  outputFolder
});
//main
try {

  
} catch (e) {
  console.error(chalk.yellowBright(e.message));
  console.log(chalk.yellowBright('usage info can be viewed via: sjmlv --help'));
}
