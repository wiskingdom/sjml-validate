const glob = require('glob');
const path = require('path');

const inputFolder = path.normalize('sample/WXOR');
const inputFolderDep = inputFolder.split(path.sep).length;
const extFilter = 'sjml'

const files = glob.sync(`${inputFolder}/**/*.${extFilter}`);
const base = path.parse(files[1]).base;
const middle = path.join(...path.normalize(files[1]).split(path.sep).slice(inputFolderDep, -1));

console.log(files);
console.log(base);
console.log(middle);