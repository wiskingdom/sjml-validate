
const plusIndex = str => {
  const re = /(\[\d+\])/;
  const strParts = str.split(re);
  return strParts.map(elem => {
    if (elem.match(re)) {
      const plusN = Number.parseInt(elem.slice(1, -1)) + 1;
      return `[${plusN}]`
    }
    return elem;
  }).join('');
};
const str = '.SJML.text.note[1002].cdata[3]';

console.log(str)
console.log(plusIndex(str))