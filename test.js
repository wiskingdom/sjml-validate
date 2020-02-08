
const a = 'abc'
let m;
if (m = a.match(/c(.)/)) {
  console.log(m[1]);
} else if (m = a.match(/a(.)/)) {
  console.log(m[1]);
}

console.log(true && (m = a.match(/c(.)/)))
