// def functions
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
  .replace(/[ 　  ﻿]+/g,' ')
  .replace(/ +/g,' ')
  .trim();

const mReplace = str => str
  .replace(/<anon type="(.+?)" n="(.+?)"\/>/g, '$1$2')
  .replace(/<anon type="(.+?)"\/>/g, '$1')
  .replace(/<\/?(message|emoji).*?\/?>/g, '')
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
  .reduce((sjAcc, sjCurr) => !Array.isArray(sjCurr.text.p) ? sjAcc : sjAcc + sjCurr.text.p
    .reduce((pAcc, pCurr) => typeof pCurr === 'string' ? pAcc + pReplace(pCurr).split(/\s+/).length : pAcc, 0)
  , 0);

const sTokenSize = obj => obj.SJML.text.u
  .reduce((acc, curr) =>  acc + uReplace(curr.cdata).split(/\s+/).length, 0);

const seTokenSize = obj => obj.SJML.text.episode
.reduce((epAcc, epCurr) => {
  return  epAcc + epCurr.scene
    .reduce((scAcc,scCurr) => {
      let sp = 0;
      let stage = 0;
      let head = 0;
      if (scCurr) {
        if (scCurr.sp) {
          sp = scCurr.sp.reduce((spAcc, spCurr) => {
            return spAcc + pReplace(spCurr.p).split(/\s+/).length;
          }, 0);
        }
        if (scCurr.stage) {
          stage = scCurr.stage.reduce((stAcc, stCurr) => {
            return stAcc + pReplace(stCurr).split(/\s+/).length;
          }, 0);
        }
        if (scCurr.head && scCurr.head.att_stage) {
          head = pReplace(scCurr.head.att_stage).split(/\s+/).length;
        }
      }
      return scAcc + sp + stage + head;
    }, 0);
}, 0);

// main function 
const xGetTokenSize = container => {
  const { schemaType, obj, passParse } = container;
  if (!passParse) {
    return { ...container, tokenSize: 'NA'  };
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
    MXRW: mTokenSize,  //메신저대화
  };

  const tokenSize = tokenSizeMap[schemaType](obj);

  return { ...container, tokenSize };
}
// export module
module.exports = { xGetTokenSize };
