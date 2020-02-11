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

  textLines.push(`${dep(1)}<text date="${att_date}" id="${att_id}" topic="${att_topic}" topic_or="${att_topic_or}">`);
  textLines.push(p.map(str => `${dep(2)}<p>${str}</p>`).join('\n'));
  textLines.push(`${dep(2)}<byline>${byline}</byline>`);
  textLines.push(`${dep(2)}<keyword>${keyword}</keyword>`);
  textLines.push(`${dep(2)}<summary>${summary}</summary>`); 
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
  lines.push(`${dep(3)}<fileId>${fileId}</fileId>`);
  lines.push(`${dep(3)}<annoLevel>${annoLevel}</annoLevel>`);
  lines.push(`${dep(3)}<sampling>${sampling}</sampling>`);
  lines.push(`${dep(3)}<class>${fileInfo.class}</class>`);
  // subclass
  if (['WXRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<subclass>${subclass}</subclass>`);
  } else if (['WCRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<subclass/>`);
  }
  lines.push(`${dep(2)}</fileInfo>`);
  // sourceInfo
  lines.push(`${dep(2)}<sourceInfo>`);
  lines.push(`${dep(3)}<title>${title}</title>`);
  lines.push(`${dep(3)}<author>${author}</author>`);
  lines.push(`${dep(3)}<publisher>${publisher}</publisher>`);
  if (['WXRW', 'WCRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<year>${sourceInfo.year}</year>`);
  }
  if (['EXRW'].includes(schemaType)) {
    lines.push(`${dep(3)}<date>${sourceInfo.date}</date>`);
    lines.push(`${dep(3)}<dateCrawl>${sourceInfo.dateCrawl}</dateCrawl>`);
    lines.push(`${dep(3)}<url>${sourceInfo.url}</url>`);
    lines.push(`${dep(3)}<view>${sourceInfo.view}</view>`);
  }
  lines.push(`${dep(2)}</sourceInfo>`);
  // profileInfo
  if (['EXRW'].includes(schemaType)) {
    const { att_sex, att_age } = header.profileInfo.personId;
    lines.push(`${dep(2)}<profileInfo>`);
    lines.push(`${dep(3)}<personId sex="${att_sex}" age="${att_age}"></personId>`);
    lines.push(`${dep(2)}</profileInfo>`);
  }

  lines.push(`${dep(1)}</header>`);
  // text
  if (['WXRW', 'WCRW', 'EXRW'].includes(schemaType)) {
    lines.push(`${dep(1)}<text>`);
    lines.push(text.p.map(str => `${dep(2)}<p>${str}</p>`).join('\n'));
    lines.push(`${dep(1)}</text>`);
    
  } else if (['NXRW'].includes(schemaType)) {
    lines.push(text.map(newsText).join('\n'));
  } else if (['SDRW','SXRW'].includes(schemaType)) {
    lines.push(`${dep(1)}<text>`);
    const { u } = text;
    const note = text.note || [];
    const misc = text.misc || [];
    const sTextLine = [...u, ...note, ...misc].sort((a, b) => a.serialNum - b.serialNum);
    lines.push(sTextLine.map( item => {
      if (item.tag === 'u') {
        const { att_who, att_n, cdata } = item;
        return `${dep(2)}<u who="${att_who}" n="${att_n}">${cdata}.</u>`;

      } else if (item.tag === 'note') {
        const { cdata } = item;
        return `${dep(2)}<note>${cdata}<note>`;

      } else if (item.tag === 'misc') {
        const { cdata } = item;
        return `${dep(2)}${cdata}`;

      } else {
        return ``;
      }
    }).join('\n'));
    lines.push(`${dep(1)}</text>`);
  }
  lines.push('</SJML>');
  lines.push('');
  return { ...container, outputXml: lines.join('\n') };
};

module.exports = { toXml };