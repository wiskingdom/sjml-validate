const obj = {
  SJML: {
    text: {
      episode: [
        {
          att_n: '123',
          scene: [
            {
              att_n: '001',
              sp: [
                {
                  p: 'episode/0/scene/0/sp/0/p'
                },
                {
                  p: 'episode/0/scene/0/sp/1/p'
                },
              ]
            },
            {
              att_n: '002',
              sp: [
                {
                  p: 'episode/0/scene/1/sp/0/p'
                },
                {
                  p: 'episode/0/scene/1/sp/1/p'
                },
              ]
            }
          ]
        }
      ]
    }
  }
};

const location = '/SJML/text/episode/0/scene/1/sp/1/p';

const getValueByPath = schemaType => location => obj => {
  const joinLocParts = locParts => `[\'${locParts.join('\'][\'')}\']`;
  const locParts = location.split('/').slice(1);
  const pathObj = joinLocParts(locParts);
  const get = pathObj => new Function('obj', `return obj${pathObj}`);

  try {
    let ids = [];
    if (schemaType === 'SERW') {
      if (location.match(/episode\/\d+/)) {
        const idPath = [...locParts.slice(0, 4), 'att_n' ];
        const id = get(joinLocParts(idPath))(obj);
        ids.push(`<episode n="${id}">`)
      } 
      if (location.match(/scene\/\d+/)) {
        const idPath = [...locParts.slice(0, 6), 'att_n' ];
        const id = get(joinLocParts(idPath))(obj);
        ids.push(`<scene n="${id}">`)
      }
    } else if (schemaType === 'EXRW') {
      if (location.match(/SJML\/\d+/)) {
        const idPath = [...locParts.slice(0, 3), 'header', 'sourceInfo', 'title'];
        const id = get(joinLocParts(idPath))(obj);
        ids.push(`in SJML which has <title>${id}</title>`)
      } 
    }
    const value = get(pathObj)(obj);
    return { 
      invalidValue: `${value}`.replace(/[\n\r]+/g, ' '), 
      locationHint: `${ids.join(' ')}`.replace(/[\n\r]+/g, ' '),
    };
  } catch {
    return { 
      invalidValue: '',
      locationHint: '',
    };
  }
};

console.log(getValueByPath('SERW')(location)(obj));