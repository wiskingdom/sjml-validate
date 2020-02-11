const uReplace = str => str
  .replace(/<\/?trunc>/g, '')
  .replace(/<\/?unclear\/?>/g, '')
  .replace(/<vocal.+?\/>/g, '')
  .replace(/<anon type="(.+?)" n="(.+?)"\/>/g, '$1$2')
  .replace(/\s/g,' ')
  .replace(/ +/g,' ')
  .trim();

  const pReplace = str => str
  .replace(/[\n\r]+/g, '\n')
  .replace(/\t/g,' ')
  .replace(/[  ]+/g,' ')
  .trim();

const wTokenSize = obj => obj.SJML.text.p
  .reduce((acc, curr) => acc + pReplace(curr).split(/\s+/).length, 0);

const nTokenSize = obj => obj.SJML.text
  .reduce((tAcc, tCurr) => tAcc + tCurr.p
    .reduce((pAcc, pCurr) => pAcc + pReplace(pCurr).split(/\s+/).length, 0)
  , 0);

const sTokenSize = obj => obj.SJML.text.u
  .reduce((acc, curr) => acc + uReplace(curr.cdata).split(/\s+/).length, 0);

const xGetTokenSize = container => {
  const { schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const tokenSizeMap = {
    WXRW: wTokenSize,
    WCRW: wTokenSize,
    NXRW: nTokenSize,
    SXRW: sTokenSize,
    SDRW: sTokenSize,
    SERW: sTokenSize,
    SFRW: sTokenSize,
    EXRW: wTokenSize,
    MDRW: wTokenSize,  //메신저대화
  };

  const tokenSize = tokenSizeMap[schemaType](obj);

  return { ...container, tokenSize };
}

module.exports = { xGetTokenSize };