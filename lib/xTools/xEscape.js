const he = require('he');

const xmlEscape = str => he.decode(str)
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;');

const skip = container => container;
const textEscape = container => {
  const { schemaType, inputXml } = container;
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
    if (acc.toggle) {
      if (line.match(/^  <\/text>/)) {
        acc.lines.push(line);
        acc.toggle = false;
      } else {
        let m;
        if (['EXRW'].includes(schemaType) && (m = line.match(/(.*?)<p>(.*?)<\/p>(.*?)/))) {
          acc.lines.push(`${m[1]}<p>${xmlEscape(m[2])}</p>${m[3]}`);
        } else {
          acc.lines.push(xmlEscape(line));
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
        let m;
        if (m = line.match(/(.*?)<title>(.*?)<\/title>(.*?)/)) {
          acc.lines.push(`${m[1]}<title>${xmlEscape(m[2])}</title>${m[3]}`);
        } else if (m = line.match(/(.*?)<author>(.*?)<\/author>(.*?)/)) {
          acc.lines.push(`${m[1]}<author>${xmlEscape(m[2])}</author>${m[3]}`);
        } else if (m = line.match(/(.*?)<publisher>(.*?)<\/publisher>(.*?)/)) {
          acc.lines.push(`${m[1]}<publisher>${xmlEscape(m[2])}</publisher>${m[3]}`);
        } else if (m = line.match(/(.*?)<url>(.*?)<\/url>(.*?)/)) {
          acc.lines.push(`${m[1]}<url>${xmlEscape(m[2])}</url>${m[3]}`);
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
