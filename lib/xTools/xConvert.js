const path = require('path');

const toWXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');

  const p = text.split(/[\n\r]+/)
    .map(str => str.replace(/ +/g, ' ').trim());
  obj.SJML.text = { p };

return obj;
};

const toNXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');
  obj.SJML.text = text.map(item => {
    const att_id = item.att_id.replace(/^(..)OR(.+)$/, '$1RW$2');
    const att_topic_or = item.att_topicOr;
    const p = Array.isArray(item.p) ? item.p : [item.p] ;
    const summary = item.summary.replace(/[\n\r]+/g, ' ').trim();

    delete item.att_topicOr;
    return { ...item, att_id, att_topic_or, p, summary };
  });
  return obj;
};

const identical = obj => obj;

const convertMap = {
  WXRW: toWXRW,
  WCRW: toWXRW,
  NXRW: toNXRW,
  EXRW: identical,
  SDRW: identical,
  SERW: identical,
  SFRW: identical,
  SXRW: identical,
};

const xConvert = container => {
  const { inputFileName, obj, schemaType, passParse } = container; 
  const { name } = path.parse(inputFileName);
  const outputFileName = name.replace(/^(..)OR(.+)$/, '$1RW$2') + '.sjml';
  if (!passParse) {
    return { ...container,outputFileName };
  }
  const convertedObj = convertMap[schemaType](obj);


  return { ...container, obj: convertedObj, outputFileName };
} 

module.exports = { xConvert };