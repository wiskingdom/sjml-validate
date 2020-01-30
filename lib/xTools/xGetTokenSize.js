const xGetTokenSize = container => {
  const { fileName, schemaType, obj, passParse } = container;
  if (!passParse) {
    return { ...container, tokenSize: 0, tokenSizeLog: '' };
  }
  let tokenSize = 0;
  if (['wr', 'wm'].includes(schemaType)) {
    tokenSize = obj['SJML']['text']['p']
    .reduce((acc, curr) => acc + curr.trim().split(' ').length, 0);
  } else if (['wn', 'wnn'].includes(schemaType)) {
    tokenSize = obj['SJML']['text'].reduce((acc, curr) => {
      const p = Array.isArray(curr.p) ? curr.p : [curr.p];
      return acc + p.reduce((pAcc, pCurr) => pAcc + `${pCurr}`.trim().split(' ').length, 0);
    }, 0);
  }
  return { ...container, tokenSize, tokenSizeLog: `${fileName}\t${tokenSize}` };
}

module.exports = { xGetTokenSize };