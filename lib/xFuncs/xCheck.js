const labelPatternToFunc = (lebel, pattern) => ({ u, reportFileName }) => u
  .filter(elem => elem.cdata.match(pattern))
  .map(elem => [reportFileName, lebel, elem.cdata]);

const checkAnon = label => ({ u, reportFileName }) => {
  const noIdName = u.find(elem => elem.cdata.match(/<anon type="name"\/>/));
  const IdName = u.find(elem => elem.cdata.match(/<anon type="name" n=.+?\/>/));
  if (noIdName && IdName) {
    const m = IdName.cdata.match(/<anon type="name" n="(.+?)"\/>/);
    const nameId = m[1] || '';
    const example = `<anon type="name"/> & <anon type="name" n="${nameId}"/>`;
    return [[reportFileName, label, example]];
  }
  return [];
};

const checkFirstWho = label => ({ u, reportFileName }) => {
  if (u[0]) {
    const att_who = u[0].att_who || '';
    const cdata = u[0].cdata || '';
    if (att_who !== 'P1' || cdata.match(/,./)) {
      const example = `<u who="${att_who}" n="1">${cdata}</u>`
      return [[reportFileName, label, example]];
    }
  }

  return [];
};

const sExtraLog = ({ obj, reportFileName }) => {
  const { u } = obj.SJML.text;
  const checkByPatterns = [
    [
      'ex1_twoSideChar', 
      /[^ ](<\/?(unclear|trunc)>|<(anon|vocal)[^>]+?>)[^ ]/
    ],
    [
      'ex2_innerSpace',
      / <\/|<[^>\/]+?> /
    ],
    [
      'ex3_anySideChar',
      /[^ ]<unclear\/>|<unclear\/>[^ ]|[^ ]<(anon|vocal)[^>]+?>( |$)/
    ]
  ].map(item => labelPatternToFunc(...item));
  const exLogFuncs = [
    ...checkByPatterns,
    checkAnon('ex4_anonNameId'),
    checkFirstWho('ex5_firstWho'),
  ];
  return exLogFuncs.reduce((acc, f) => [...acc, ...f({ u, reportFileName })], []);
}

const skip = () => [];

// controller
const xCheck = container => {
  const { inputFileName, outputFileName, schemaType, obj, passParse } = container;
  if (!passParse) {
    return container;
  }
  const reportFileName = outputFileName || inputFileName;

  const extraLogMap = {
    WXRW: skip,
    WCRW: skip,
    NXRW: skip,
    SXRW: sExtraLog,
    SDRW: sExtraLog,
    SERW: skip,
    SFRW: skip,
    EXRW: skip,
    MXRW: skip,  //메신저대화
  };
  const extraLog = extraLogMap[schemaType]({ obj, reportFileName });

  return { ...container, extraLog };
}

module.exports = { xCheck };