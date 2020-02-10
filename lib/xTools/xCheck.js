const checkSideTagChar = ({ u, reportFileName }) => {
  const sideChar = u
    .find(elem => elem.cdata.match(/[^ ](<\/?(unclear|trunc)>|<(anon|vocal)[^>]+?>)[^ ]/));
  return sideChar ? [['ex1_sideTagChar', reportFileName, sideChar.cdata]] : false;
};

const checkInnerSpace = ({ u, reportFileName }) => {
  const innerSpace = u.find(elem => elem.cdata.match(/ <\/|<[^>\/]+?> /));
  return innerSpace ? [['ex2_innerSpace', reportFileName, innerSpace.cdata]] : false;
};

const checkSideSingleTagChar = ({ u, reportFileName }) => {
  const singleTagSide = u
    .find(elem => elem.cdata.match(/[^ ]<unclear\/>|<unclear\/>[^ ]|[^ ]<(anon|vocal)[^>]+?>( |$)/));
  return singleTagSide ? [['ex3_sideSingleTagChar', reportFileName, singleTagSide.cdata]] : false;
};

const checkAnon = ({ u, reportFileName }) => {
  const noIdName = u.find(elem => elem.cdata.match(/<anon type="name"\/>/));
  const IdName = u.find(elem => elem.cdata.match(/<anon type="name" n=.+?\/>/));
  if (noIdName && IdName) {
    const m = IdName.cdata.match(/<anon type="name" n=(.+?)\/>/);
    const nameId = m[1] || '';
    const example = `<anon type="name"/> & <anon type="name" n="${nameId}"/>`;
    return [['ex4_anonNameId', reportFileName, example]];
  }
  return false;
};

const checkFirstWho = ({ u, reportFileName }) => {
  const { att_who, cdata } = u[0];
  if (att_who !== 'P1') {
    const example = `<u who="${att_who}" n="1">${cdata}</u>`
    return [['ex5_firstWho', reportFileName, example]];
  } else if (cdata.match(/,./)) {
    const example = `<u who="${att_who}" n="1">${cdata}</u>`
    return [['ex5_firstWho', reportFileName, example]];
  }
  return false;
};

const sExtraLog = ({ obj, reportFileName }) => {
  const { u } = obj.SJML.text;
  const exLogFuncs = [
    checkSideTagChar,
    checkSideSingleTagChar,
    checkInnerSpace,
    checkAnon,
    checkFirstWho,
  ];
  return exLogFuncs
    .reduce((acc, f) => {
      const extraLog = f({ u, reportFileName }) || [];
      return [...acc, ...extraLog];
    }, []);
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
  };
  const extraLog = extraLogMap[schemaType]({ obj, reportFileName });

  return { ...container, extraLog };
}

module.exports = { xCheck };