const uReplace = str => str
  .replace(/<\/?trunc>/g, '')
  .replace(/<\/?unclear\/?>/g, '')
  .replace(/<vocal.+?\/>/g, '')
  .replace(/<anon type="(.+?)" n="(.+?)"\/>/g, '$1$2')
  .replace(/<anon type="(.+?)"\/>/g, '$1')
  .replace(/\s/g,' ')
  .replace(/ +/g,' ')
  .trim();

const pReplace = str => str
  .replace(/[\n\r]+/g, '\n')
  .replace(/\t/g,' ')
  .replace(/[  　]+/g,' ')
  .trim();

const mReplace = str => str
  .replace(/\s/g,' ')
  .replace(/ +/g,' ')
  .trim();

const mTokenSize = obj => obj.SJML.text.u
  .reduce((acc, curr) => acc + mReplace(curr.cdata).split(/\s+/).length, 0);
const wTokenSize = obj => obj.SJML.text.p
  .reduce((acc, curr) => acc + pReplace(curr).split(/\s+/).length, 0);

const nTokenSize = obj => obj.SJML.text
  .reduce((tAcc, tCurr) => tAcc + tCurr.p
    .reduce((pAcc, pCurr) => pAcc + pReplace(pCurr).split(/\s+/).length, 0)
  , 0);

const eTokenSize = obj => obj.SJMLGROUP.SJML
.reduce((sjAcc, sjCurr) => sjAcc + sjCurr.text.p
  .reduce((pAcc, pCurr) => pAcc + pReplace(pCurr).split(/\s+/).length, 0)
, 0);

const sTokenSize = obj => obj.SJML.text.u
  .reduce((acc, curr) => acc + uReplace(curr.cdata).split(/\s+/).length, 0);

const seTokenSize = obj => obj.SJML.text.episode
.reduce((epAcc, epCurr) => {
  return  epAcc + epCurr.scene
    .reduce((scAcc,scCurr) => {
      if (scCurr.sp) {
        scAcc = scAcc + scCurr.sp.reduce((spAcc, spCurr) => {
          return spAcc + uReplace(spCurr.p).split(/\s+/).length;
        }, 0);
      }
      return scAcc;
    }, 0);
}, 0);

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
    SERW: seTokenSize,
    SFRW: sTokenSize,
    EXRW: eTokenSize,
    MDRW: mTokenSize,  //메신저대화
  };

  const tokenSize = tokenSizeMap[schemaType](obj);

  return { ...container, tokenSize };
}

module.exports = { xGetTokenSize };