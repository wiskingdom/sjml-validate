const path = require('path');

const toWXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');

  const p = text.split(/[\n\r]+/)
   .map(str => str.replace(/[ \t]+/g, ' ').trim());
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
    const summary = item.summary
      .replace(/[\n\r\t]+/g, ' ').replace(/ +/g, ' ').trim();
    const p = item.p.map(str => str
        .replace(/\t+/g, ' ').replace(/ +/g, ' ').trim());
    delete item.att_topicOr;
    return { ...item, att_id, att_topic_or, p, summary };
  });
  return obj;
};

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
    WXRW: toWXRW,  //문어
    WCRW: toWXRW,  //문어(잡지)
    NXRW: toNXRW,  //신문
    SXRW: skip,    //구어
    SDRW: skip,    //구어(일상대화
    SERW: skip,    //준구어(대본)
    SFRW: skip,    //준구어(연설)
    EXRW: skip,    //웹
  };
  const convertedObj = convertMap[schemaType](obj);

  return { ...container, obj: convertedObj, outputFileName };
} 

module.exports = { xConvert };