'use strict';
function App (_p5) {
  window._appP5 = _p5;

  let myInfo;

  _p5.preload = () => {
    myInfo = _p5.loadJSON('me.json');
  };

  _p5.setup = () => {
    console.debug(myInfo);
    _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
  };

  _p5.draw = () => {
    _p5.background(0);

    _p5.fill(255);
    _p5.text(`welcome ${myInfo.name}`, _p5.width / 2, _p5.height / 2);
  };
}
