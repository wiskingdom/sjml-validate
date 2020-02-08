const fs = require('fs');
const xToJ = require('fast-xml-parser');

const filePath = 'C:\\Users\\yeon\\Desktop\\sample\\SDRW\\SDRW1900001415.SJML';
const xml = fs.readFileSync(filePath, 'utf8');

const xmlparts = xml.split(/<\/?text>/);
const headerxml = [xmlparts[0], xmlparts[2]].join('\n');
const textObj = xmlparts[1].trim().split(/[\n\r]+/)
  .map((line, index) => {
    const trimmed = line.trim()
    if (trimmed.match(/^<u who=".+?" n=".+?">.*?<\/u>$/)) {
      const m = trimmed.match(/<u who="(.+?)" n="(.+?)">(.*?)<\/u>/)
      return { tag: 'u', att_who: m[1], att_n: m[2], cdata: m[3], serialNum: index }
    } else if (trimmed.match(/^<note>.*?<\/note>$/)) {
      const m = trimmed.match(/<note>(.*?)<\/note>/)
      return { tag: 'note', cdata: m[1], serialNum: index }
    } else {
      console.log(trimmed)
      return { tag: 'misc', cdata: line, serialNum: index};
    }
  });

const u = textObj.filter(item => item.tag === 'u');
const note = textObj.filter(item => item.tag === 'note');
const misc = textObj.filter(item => item.tag === 'misc');


const parseOptions = {
  attributeNamePrefix : 'att_',
  ignoreAttributes : false,
  parseNodeValue : false,
};

try {
var obj = xToJ.parse(headerxml, parseOptions, true);
obj.SJML.text = { u };
if (note[0]) {
  obj.SJML.text.note = note;
}
if (misc[0]) {
  obj.SJML.text.misc = misc;
}

fs.writeFileSync('C:\\Users\\yeon\\Desktop\\sample.json', JSON.stringify(obj, null, 2));


} catch (error) {
console.log(`${filePath}\t${error.message}`);

}
