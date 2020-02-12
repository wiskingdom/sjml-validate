const he = require('he');

const xmlEscape = str => he.decode(str)
  .replace(/&/g, '&amp;')
  .replace(/>/g, '&gt;')
  .replace(/</g, '&lt;');

const skip = container => container;
const wTextEscape = container => {
  const { schemaType, inputXml } = container;
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
    if (acc.toggle) {
      if (line.match(/^  <\/text>/)) {
        acc.lines.push(line);
        acc.toggle = false;
      } else {
        acc.lines.push(xmlEscape(line));
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

const wEscape = container => [headerEscape, wTextEscape]
  .reduce((data, f) => f(data), container);

const seEscape = container => {
  const { inputXml } = container;
  const escapedXml = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
        if (m = line.match(/<(p|stage)>(.*?)<\/(p|stage)>/)) {
          acc.lines.push(`<${m[1]}>${xmlEscape(m[2])}</${m[3]}>`);
        } else {
          acc.lines.push(line);
        }
      return acc;
  }, {lines: [], toggle: false}).lines.join('\n');
  return { ...container, inputXml:escapedXml };
};

const eEscape = container => {
  const { inputXml } = container;
  const escapedLines = inputXml.split(/[\n\r]+/).reduce((acc, line) => {
        if (m = line.match(/<(p|url|title)>(.*?)<\/(p|url|title)>/)) {
          acc.lines.push(`<${m[1]}>${xmlEscape(m[2])}</${m[3]}>`);
        } else {
          acc.lines.push(line);
        }
      return acc;
  }, {lines: [], toggle: false}).lines;
  return { ...container, inputXml:escapedLines.join('\n') };
};
// controller
const xEscape = container => {
  const { passEncoding, runType } = container;
  if (!passEncoding) {
    return container;
  }
  let schemaType = container.schemaType;
  if (runType === 'convert') {
    schemaType = `${schemaType}c`;
  } 
  const escapeMap = {
    // 검증
    WXRW: skip,  //문어
    WCRW: skip,  //문어(잡지)
    NXRW: skip,  //신문
    SXRW: skip,  //구어
    SDRW: skip,  //구어(일상대화)
    SERW: seEscape,  //준구어(대본)
    SFRW: skip,  //준구어(연설)
    EXRW: eEscape,  //웹
    MXRW: skip,  //메신저대화
    // 변환
    WXRWc: wEscape,  //문어 변환
    WCRWc: wEscape,  //문어(잡지) 변환
    NXRWc: skip,  //신문 변환
  };
    
  return escapeMap[schemaType](container);
} 

module.exports = { xEscape };
