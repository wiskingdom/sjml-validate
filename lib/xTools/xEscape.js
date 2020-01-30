const escape = str => str.replace(/ +/g,' ').trim()
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;');

const xEscape = container => {
  const { schemaType, inputXml, passEncoding } = container;
  if (!['WXRW', ''].includes(schemaType) || !passEncoding) {
    return container;
  }
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
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
  return { ...container, inputXml:escapedXml };
} 


module.exports = { xEscape };