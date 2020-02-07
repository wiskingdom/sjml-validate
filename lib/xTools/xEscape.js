const escape = str => str
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;')
  .replace(/\t+/g, ' ')
  .replace(/ +/g, ' ')
  .trim();

const skip = container => container;
const textEscape = container => {
  const { schemaType, inputXml } = container;
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
    if (acc.toggle) {
      if (line.match(/^  <\/text>/)) {
        acc.lines.push(line);
        acc.toggle = false;
      } else {
        if (['EXRW'].includes(schemaType) && line.match(/<p>.*?<\/p>/)) {
          const m = line.match(/<p>(.*?)<\/p>/);
          acc.lines.push(`<p>${escape(m[1])}</p>`);
        } else {
          acc.lines.push(escape(line));
        }
      }
    } else {
        acc.lines.push(line);
      if (line.match(/^  <text>/)) {
        acc.toggle = true;
      }
    }
    return acc;
  }, {lines: [], toggle: false}).lines.join('\n');
  return { ...container, inputXml:escapedXml };
};
const headerEscape = container => {
  const { inputXml } = container;
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
    if (acc.toggle) {
      if (line.match(/^  <\/header>/)) {
        acc.lines.push(line);
        acc.toggle = false;
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
        } else if (line.match(/<url>.*?</)) {
          const m = line.match(/<url>(.*?)</);
          acc.lines.push(`<url>${escape(m[1])}</url>`);
        } else {
          acc.lines.push(line);
        }
      }
    } else {
      acc.lines.push(line);
      if (line.match(/^  <header>/)) {
        acc.toggle = true;
      }
    }
    return acc;
  }, {lines: [], toggle: false}).lines.join('\n');
  return { ...container, inputXml:escapedXml };
};

const fullEscape = container => [headerEscape, textEscape]
  .reduce((data, f) => f(data), container);

// controller
const xEscape = container => {
  const { schemaType, passEncoding } = container;
  if (!passEncoding) {
    return container;
  }
  const escapeMap = {
    WXRW: fullEscape,  //문어
    WCRW: fullEscape,  //문어(잡지)
    NXRW: skip,  //신문
    SXRW: skip,  //구어
    SDRW: skip,  //구어(일상대화)
    SERW: skip,  //준구어(대본)
    SFRW: skip,  //준구어(연설)
    EXRW: fullEscape,  //웹
  };
    
  return escapeMap[schemaType](container);
} 

module.exports = { xEscape };
