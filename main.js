const Couple = require('./Couple.js');

const couple = [];
const coupleSession = [
  '',
  '',

  '',
  '',

  '',
  '',
];

for (let i = 0; i < coupleSession.length/2; i++) {
  setTimeout(()=>{
    couple[i] = new Couple(coupleSession[i*2], coupleSession[i*2+1], i);
    couple[i].init();
  }, i * 1000 * 15);
}
