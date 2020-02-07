const uReplace = str => str.trim()
  .replace(/<\/?trunc>/g, '')
  .replace(/<\/?unclear\/?>/g, '')
  .replace(/<vocal desc=.+?\/>/g, '')
  .replace(/<anon type="(.+?)" n="(.+?)"\/>/g, '$1$2');




const xGetTokenSize = container => {
  const { schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  let tokenSize = 0;
  if (['WXRW', 'WCRW', 'EXRW'].includes(schemaType)) {
    tokenSize = obj['SJML']['text']['p']
    .reduce((acc, curr) => acc + curr.trim().split(' ').length, 0);
  } else if (['NXRW'].includes(schemaType)) {
    tokenSize = obj['SJML']['text'].reduce((acc, curr) => {
      const p = Array.isArray(curr.p) ? curr.p : [curr.p];
      return acc + p.reduce((pAcc, pCurr) => pAcc + `${pCurr}`.trim().split(' ').length, 0);
    }, 0);
  } else if (['SDRW', 'SXRW'].includes(schemaType)) {
    tokenSize = obj['SJML']['text'].reduce((acc, curr) => {
      if (curr.u) {
        const { str } = curr.u;
        const cnt = uReplace(str).split(' ').length;
        return acc + cnt;
      } else {
        return acc;
      }
    }, 0);
  }
  return { ...container, tokenSize };
}

module.exports = { xGetTokenSize };