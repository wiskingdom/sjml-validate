// import modules
const path = require('path');

// def functions
const pReplace = str => str
  .replace(/[\n\r]+/g, '\n')
  .replace(/\t/g,' ')
  .replace(/[ 　  ﻿]+/g,' ')
  .replace(/ +/g,' ')
  .trim();

const toWXRW = obj => {
  const { header, text } = obj.SJML;
  const { fileId } = header.fileInfo;
  obj.SJML.header.fileInfo.fileId = fileId.replace(/^(..)OR(.+)$/, '$1RW$2');

  const p = text.trim().split(/[\n\r]+/)
   .map(str => pReplace(str));
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
      .replace(/\s/g, ' ').replace(/ +/g, ' ').trim();
    const p = item.p.map(str => pReplace(str));
    const byline = item.byline
      .replace(/ +/g, ' ').trim();
    delete item.att_topicOr;
    return { ...item, att_id, att_topic_or, p, byline, summary };
  });
  return obj;
};

const skip = obj => obj;

// main function 
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
    MXRW: skip,    //메신저대화
  };
  const convertedObj = convertMap[schemaType](obj);

  return { ...container, obj: convertedObj, outputFileName };
} 

// export module
module.exports = { xConvert };
