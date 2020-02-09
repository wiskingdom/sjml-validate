const xToJ = require('fast-xml-parser');

const xml = '<u>hi <t>k&im</u>'

const validness = xToJ.validate(xml);

const obj = xToJ.parse(xml)

console.log(validness)

