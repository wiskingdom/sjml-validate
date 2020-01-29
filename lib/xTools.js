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
        if (line.match(/<p>.*<\/p>/)) {
          const m = line.match(/<p>(.*?)<\/p>/)
          acc.lines.push(`<p>${escape(m[1])}</p>`);
        } else {
          acc.lines.push(escape(line));
        }
      }
      
    } else {
      
      if (line.match(/<title>/)) {
        const m = line.match(/<title>(.*?)</)
        acc.lines.push(`<title>${escape(m[1])}</title>`);
      } else if (line.match(/<author>/)) {
        const m = line.match(/<author>(.*?)</)
        acc.lines.push(`<author>${escape(m[1])}</author>`);
      } else if (line.match(/<publisher>/)) {
        const m = line.match(/<publisher>(.*?)</)
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
const toX = souceType => obj => {
const { SJML } = obj;
const { header, text } = SJML;
const { fileInfo, sourceInfo } = header;
const { fileId, annoLevel, sampling } = fileInfo; // class dropped

const subclass = souceType === 'wr' ? fileInfo.subclass : ''; 

const { title, author, publisher, year } = sourceInfo;
const { p } = text;
let lines = [];
lines.push('<?xml version="1.0" encoding="utf-8"?>');
lines.push('<SJML>');

lines.push('  <header>');
//
lines.push('    <fileInfo>');
lines.push(`      <fileId>${fileId}</fileId>`);
lines.push(`      <annoLevel>${annoLevel}</annoLevel>`);
lines.push(`      <sampling>${sampling}</sampling>`);
lines.push(`      <class>${fileInfo.class}</class>`);
if (souceType === 'wr') lines.push(`      <subclass>${subclass}</subclass>`);
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
lines.push('  <text>');
lines.push(p.map(str => `    <p>${str}</p>`).join('\n'));
lines.push('  </text>');
lines.push('</SJML>');
lines.push('');
return lines.join('\n');
};


module.exports = { xEscape, toX };