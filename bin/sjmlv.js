const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const { xMain } = require('../lib/xMain.js');

const lf = '\t\t\t      '
const blf = lf + '  - '

program
  .option('-c, --convert', `run convert mode
    ${lf}  (default: run validate mode)`)
  .option('-s, --schema <Type>', `set an schema type
    ${blf}WXRW: 문어-원시
    ${blf}WCRW: 문어(잡지)-원시
    ${blf}NXRW: 신문-원시
    ${blf}EXRW: 웹-원시
    ${blf}SXRW: 구어-원시
    ${blf}SDRW: 구어(일상대화)-원시
    ${blf}SERW: 준구어(대본)-원시
    ${blf}SFRW: 준구어(연설)-원시`)
  .option('-i, --input <dir_path>', 'set a dir path has input files (required)')
  .option('-e, --ext [ext_name]', `set a extention name of target input files
    ${lf}  (default: sjml)`)
  .option('-o, --output [dir_path]', `set a dir path for results and report
    ${lf}  (default: ./output/)`)
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
  console.error(chalk.red('Error: option \'-i, --input\' is required'));
  console.log(chalk.blue('usage info can be viewed via: sjmlv --help'));
  process.exit();
} 
if (!program.schema) {
  program.key = '';
  console.error(chalk.red('Error: option \'-s, --schema\' is required'));
  console.log(chalk.blue('usage info can be viewed via: sjmlv --help'));
  process.exit();
} 
if (!fs.existsSync(program.input)) {
  console.error(chalk.red(`no such directory: \'${program.input}\'`));
  process.exit();  
} 
if (!types.includes(program.schema)) {
  console.error(chalk.red(`invalid type: \'${program.schema}\'`));
  process.exit();  
}

if (!program.convert) {
  program.convert = false;
}
if (!program.output) {
  program.output = './output/';
}
if (!program.ext) {
  program.ext = 'sjml';
}

const { convert, schema, input, ext, output } = program;



const runType = convert ? 'convert' : 'validate' ;
const schemaType = schema;
const inputFolder = path.normalize(input);
const extFilter = ext;
const outputFolder = path.normalize(output);

// main
xMain({
  runType,
  schemaType,
  inputFolder,
  extFilter,
  outputFolder
});

/* 
console.log({
  runType,
  schemaType,
  inputFolder,
  extFilter,
  outputFolder
});
*/