const path = require('path');

const toWXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');
try {
  const p = text.split(/[\n\r]+/)
   .map(str => str.replace(/ +/g, ' ').trim());
  obj.SJML.text = { p };

} catch (e) {
  console.log(e.message);
}

return obj;
};

const toNXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');
  obj.SJML.text = text.map(item => {
    const att_id = item.att_id.replace(/^(..)OR(.+)$/, '$1RW$2');
    const att_topic_or = item.att_topicOr;
    const summary = item.summary.replace(/[\n\r]+/g, ' ').trim();
    delete item.att_topicOr;
    return { ...item, att_id, att_topic_or, summary };
  });
  return obj;
};
// 검증으로 옮김
const tegPrep = str => str
  .replace(/ +/g, ' ')
  .replace(/([\.\?\,]) +?(<\/unclear>)/g, '$1$2')
  .replace(/([\.\?\,]) +?(<\/trunc>)/g, '$1$2')
  .replace(/^(<unclear>) +?([^ ])/g, '$1$2')
  .replace(/^(<trunc>) +?([^ ])/g, '$1$2')
  .replace(/(<unclear\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<unclear\/>)/g, '$1 $2')
  .replace(/(<trunc\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<trunc\/>)/g, '$1 $2')
  .replace(/(<anon .+?\/>)([^ ])/g, '$1 $2')
  .replace(/([^ ])(<anon .+?\/>)/g, '$1 $2')
  .replace(/ +/g, ' ')
  .trim();
// 검증으로 옮김
const editSDRW = obj => {
  const { text } =  obj.SJML;
  obj.SJML.text.u = text.map(item => {
    const { cdata } = item;
    item.cdata = tegPrep(cdata);
    return item;
  });
  return obj;
}

const skip = obj => obj;

// controller
const xConvert = container => {
  const { inputFileName, obj, schemaType, passParse } = container; 
  const { name } = path.parse(inputFileName);
  const outputFileName = name.replace(/^(..)OR(.+)$/, '$1RW$2') + '.sjml';
  if (!passParse) {
    return { ...container, outputFileName };
  }
  const convertMap = {
    WXRW: toWXRW,
    WCRW: toWXRW,
    NXRW: toNXRW,
    SXRW: skip,
    SDRW: skip,
    SERW: skip,
    SFRW: skip,
    EXRW: skip,
  };
  const convertedObj = convertMap[schemaType](obj);

  return { ...container, obj: convertedObj, outputFileName };
} 

module.exports = { xConvert };