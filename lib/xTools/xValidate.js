const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv(); 

const logger = fileName => e => `${fileName}\t${e.dataPath}\t${e.message}`
  .replace(/\n/g, '\\n').replace(/\r/g, '\\r')

const xValidate = container => {
  const { inputFileName, outputFileName, schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const reportFileName = outputFileName || inputFileName;
  const schema = JSON.parse(fs.readFileSync(`schema/${schemaType}.json`, 'utf8'));
  const validate = ajv.compile(schema);
  
  let validLog = ''
  const valid = validate(obj);
  if (!valid) {
    validLog = validate.errors.map(logger(reportFileName)).join('\n');
  }
  const passValid = !!valid;

  return { ...container, passValid, validLog };
}

module.exports = { xValidate };