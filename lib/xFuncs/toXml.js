const dep = int => ' '.repeat(int*2);
const newsText = item => {
  const textLines = [];
  const {
    att_date,
    att_id,
    att_topic,
    att_topic_or,
    p,
    byline,
    keyword,
    summary,
  } = item;

  textLines.push(`${dep(1)}<text date="${att_date || ''}" id="${att_id || ''}" topic="${att_topic}" topic_or="${att_topic_or || ''}">`);
  textLines.push(p.map(str => `${dep(2)}<p>${str}</p>`).join('\n'));
  textLines.push(`${dep(2)}<byline>${byline || ''}</byline>`);
  textLines.push(`${dep(2)}<keyword>${keyword || ''}</keyword>`);
  textLines.push(`${dep(2)}<summary>${summary || ''}</summary>`); 
  textLines.push(`${dep(1)}</text>`);
  return textLines.join('\n');
}
const toXml = container => {
  const { schemaType,  obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const { SJML } = obj;
  const { header, text } = SJML;
  const { fileInfo, sourceInfo } = header;
  const { fileId, annoLevel, sampling } = fileInfo; // class dropped

  const subclass = fileInfo.subclass; 

  const { title, author, publisher } = sourceInfo;

  const lines = [];
  lines.push('<?xml version="1.0" encoding="utf-8"?>');
  lines.push('<SJML>');

  lines.push(`${dep(1)}<header>`);
  // fileInfo
  lines.push(`${dep(2)}<fileInfo>`);
  lines.push(`${dep(3)}<fileId>${fileId || ''}</fileId>`);
  lines.push(`${dep(3)}<annoLevel>${annoLevel || ''}</annoLevel>`);
  lines.push(`${dep(3)}<sampling>${sampling || ''}</sampling>`);
  lines.push(`${dep(3)}<class>${fileInfo.class || ''}</class>`);
  // subclass
  if (['WXRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<subclass>${subclass || ''}</subclass>`);
  } else if (['WCRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<subclass/>`);
  }
  lines.push(`${dep(2)}</fileInfo>`);
  // sourceInfo
  lines.push(`${dep(2)}<sourceInfo>`);
  lines.push(`${dep(3)}<title>${title || ''}</title>`);
  lines.push(`${dep(3)}<author>${author || ''}</author>`);
  lines.push(`${dep(3)}<publisher>${publisher || ''}</publisher>`);
  lines.push(`${dep(3)}<year>${sourceInfo.year || ''}</year>`);
  lines.push(`${dep(2)}</sourceInfo>`);
  lines.push(`${dep(1)}</header>`);
  // text
  if (['WXRW', 'WCRW'].includes(schemaType)) {
    lines.push(`${dep(1)}<text>`);
    lines.push(text.p.map(str => `${dep(2)}<p>${str}</p>`).join('\n'));
    lines.push(`${dep(1)}</text>`);
    
  } else if (['NXRW'].includes(schemaType)) {
    lines.push(text.map(newsText).join('\n'));
  } 
  lines.push('</SJML>');
  lines.push('');
  return { ...container, outputXml: lines.join('\n') };
};

module.exports = { toXml };