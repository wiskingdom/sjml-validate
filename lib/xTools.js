const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const xToJ = require('fast-xml-parser');
const ajv = new Ajv(); 

const escape = str => str.replace(/ +/g,' ').trim()
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;')
  

const xEscape = str => str.split(/[\n\r]+/)
  .reduce((acc, line) => {
    if (acc.toggle) {
      if (line.match(/<\/text>/)) {
        acc.lines.push(line);
        acc.toggle = false;
      } else {
        if (line.match(/<p>.*?<\/p>/)) {
          const m = line.match(/<p>(.*?)<\/p>/);
          acc.lines.push(`<p>${escape(m[1])}</p>`);
        } else {
          acc.lines.push(escape(line));
        }
      }
      
    } else {
      
      if (line.match(/<title>.*?</)) {
        const m = line.match(/<title>(.*?)</);
        acc.lines.push(`<title>${escape(m[1])}</title>`);
      } else if (line.match(/<author>.*?</)) {
        const m = line.match(/<author>(.*?)</);
        acc.lines.push(`<author>${escape(m[1])}</author>`);
      } else if (line.match(/<publisher>.*?</)) {
        const m = line.match(/<publisher>(.*?)</);
        acc.lines.push(`<publisher>${escape(m[1])}</publisher>`);
      } else {
        acc.lines.push(line);
      }
      
      if (line.match(/<text>/)) {
        acc.toggle = true;
      }
    }
    
    return acc;
  }, {lines: [], toggle: false}).lines.join('\n');

  // souceType: wr, wn, ww, sd, ss
const toX = sourceType => obj => {
  const { SJML } = obj;
  const { header, text } = SJML;
  const { fileInfo, sourceInfo } = header;
  const { fileId, annoLevel, sampling } = fileInfo; // class dropped

  const subclass = sourceType === 'wr' ? fileInfo.subclass : ''; 

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
  if (sourceType === 'wr') lines.push(`      <subclass>${subclass}</subclass>`);
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
  if (['wr', 'wm'].includes(sourceType)) {
    lines.push('  <text>');
    lines.push(text.p.map(str => `    <p>${str}</p>`).join('\n'));
    lines.push('  </text>');
    
  } else if (['wn'].includes(sourceType)) {
    lines.push(text.map( item => {
      const textLines = [];
      const { p, byline, keyword, summary } = item;
      const date = item['@_date'];
      const id = item['@_id'];
      const topic = item['@_topic'];
      const topicOr = item['@_topicOr'];
      textLines.push(`  <text date="${date}" id="${id}" topic="${topic}" topic_or="${topicOr}">`);
      textLines.push(p.map(str => `    <p>${str}</p>`).join('\n'));
      textLines.push(`    <byline>${byline}</byline>`);
      textLines.push(`    <keyword>${keyword}</keyword>`);
      textLines.push(`    <summary>${summary.replace(/[\n\r]+/g, '\n').replace(/\n/g, ' ').trim()}</summary>`);
      textLines.push('  </text>');
      return textLines.join('\n');
    }).join('\n'));
  }
  lines.push('</SJML>');
  lines.push('');
  return lines.join('\n');
};

const xValidate = sourceType => filePath => {
  const schema = JSON.parse(fs.readFileSync(`schema/${sourceType}.json`, 'utf8'));
  const fileName = filePath.split(path.sep).reverse()[0];
  const xml = fs.readFileSync(filePath, 'utf8');
  const validate = ajv.compile(schema);
  const escapedXml = xEscape(xml);
  const result = {
    fileName,
    errLog: [],
    validLog: [],
    tokenSize: '',
    xml:''
  };

  try {
    xToJ.parse(xml, {ignoreAttributes : false}, true);
  } catch (error) {
    result.errLog.push(`${fileName}\t01\t${error.message}`);
  }

  try {
    var obj = xToJ.parse(escapedXml, {ignoreAttributes : false}, true);
    // for xmls have no p tags
    if (['wr', 'wm'].includes(sourceType)) {
      if (!obj['SJML']['text']['p']) {
        const p = obj['SJML']['text'].split(/[\n\r]+/)
        .map(str => str.replace(/ +/g, ' ').trim());
        obj['SJML']['text'] = { p };
      }
    }
    
    let tokenSize = 0;
    result.xml = toX(sourceType)(obj);
    if (['wr', 'wm'].includes(sourceType)) {
      tokenSize = obj['SJML']['text']['p']
      .reduce((acc, curr) => acc + curr.trim().split(' ').length, 0);
    } else if (['wn'].includes(sourceType)) {
      tokenSize = obj['SJML']['text']
        .reduce((acc, curr) => acc + curr.p.reduce((pAcc, pCurr) => pAcc + `${pCurr}`.trim().split(' ').length, 0), 0);
    }
    result.tokenSize = `${fileName}\t${tokenSize}`;
    const valid = validate(obj);
    if (!valid) {
      const validLog = validate.errors.map(e => `${fileName}\t${e.dataPath}\t${e.message}`);
      console.log(validLog.join('\n'));
      result.validLog.push(validLog.join('\n'));
    }

  } catch (error) {
    console.log(`${fileName}\t02\t${error.message}`);
    result.errLog.push(`${fileName}\t02\t${error.message}`);
  }

  return result;
};

module.exports = { xValidate, xEscape };