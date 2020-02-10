const text = '저는 애니<anon type="name" n="2"/>션<truc>을</trunc> 좋아했<hi/>어요.';

const matchs = text.match(/<(.+?)[ \/>]/g);
const tags = matchs ? matchs.map(m => m.split(/[<>\/ ]+/).join('')) : [];

//const invalid = matchs ? matchs.find()

console.log(!!['h'].find(elem => !['hi'].includes(elem)));

