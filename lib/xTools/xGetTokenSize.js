const xGetTokenSize = container => {
  const { schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  let tokenSize = 0;
  if (['WXRW', 'WCRW'].includes(schemaType)) {
    tokenSize = obj['SJML']['text']['p']
    .reduce((acc, curr) => acc + curr.trim().split(' ').length, 0);
  } else if (['NXRW', 'NXOR'].includes(schemaType)) {
    tokenSize = obj['SJML']['text'].reduce((acc, curr) => {
      const p = Array.isArray(curr.p) ? curr.p : [curr.p];
      return acc + p.reduce((pAcc, pCurr) => pAcc + `${pCurr}`.trim().split(' ').length, 0);
    }, 0);
  }
  return { ...container, tokenSize };
}

module.exports = { xGetTokenSize };