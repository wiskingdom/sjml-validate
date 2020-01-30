  // souceType: wr, wn, ww, sd, ss
  const toXml = container => {
    const { schemaType,  obj, passParse } = container;
    if (!passParse) {
      return container;
    }
    const { SJML } = obj;
    const { header, text } = SJML;
    const { fileInfo, sourceInfo } = header;
    const { fileId, annoLevel, sampling } = fileInfo; // class dropped
  
    const subclass = schemaType === 'wr' ? fileInfo.subclass : ''; 
  
    const { title, author, publisher, year } = sourceInfo;
  
    const lines = [];
    lines.push('<?xml version="1.0" encoding="utf-8"?>');
    lines.push('<SJML>');
  
    lines.push('  <header>');
    //
    lines.push('    <fileInfo>');
    lines.push(`      <fileId>${fileId}</fileId>`);
    lines.push(`      <annoLevel>${annoLevel}</annoLevel>`);
    lines.push(`      <sampling>${sampling}</sampling>`);
    lines.push(`      <class>${fileInfo.class}</class>`);
    if (schemaType === 'wr') lines.push(`      <subclass>${subclass}</subclass>`);
    lines.push('    </fileInfo>');
    //
    lines.push('    <sourceInfo>');
    lines.push(`      <title>${title}</title>`);
    lines.push(`      <author>${author}</author>`);
    lines.push(`      <publisher>${publisher}</publisher>`);
    lines.push(`      <year>${year}</year>`);
    lines.push('    </sourceInfo>');
    lines.push('  </header>');
    //
    if (['wr', 'wm'].includes(schemaType)) {
      lines.push('  <text>');
      lines.push(text.p.map(str => `    <p>${str}</p>`).join('\n'));
      lines.push('  </text>');
      
    } else if (['wn', 'wnn'].includes(schemaType)) {
      lines.push(text.map( item => {
        const textLines = [];
        const { byline, keyword, summary } = item;
        const p = Array.isArray(item.p) ? item.p : [item.p];
        const date = item['@_date'];
        const id = item['@_id'];
        const topic = item['@_topic'];
        let topic_or = '';
        if (schemaType === 'wn') { //변경
          topic_or = item['@_topicOr']; 
        } else if (schemaType === 'wnn') {
          topic_or = item['@_topic_or'];
        }
        
        textLines.push(`  <text date="${date}" id="${id}" topic="${topic}" topic_or="${topic_or}">`);
        textLines.push(p.map(str => `    <p>${str}</p>`).join('\n'));
        textLines.push(`    <byline>${byline}</byline>`);
        textLines.push(`    <keyword>${keyword}</keyword>`);
        textLines.push(`    <summary>${summary.replace(/[\n\r]+/g, '\n').replace(/\n/g, ' ').trim()}</summary>`); //변경
        textLines.push('  </text>');
        return textLines.join('\n');
      }).join('\n'));
    }
    lines.push('</SJML>');
    lines.push('');
    return { ...container, targetXml: lines.join('\n') };
  };

  module.exports = { toXml };