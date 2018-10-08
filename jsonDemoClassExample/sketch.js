'use strict';
function App (_p5) {
  window._appP5 = _p5;

  let myInfo;

  _p5.preload = () => {
    myInfo = _p5.loadJSON('me.json');
  };

  _p5.setup = () => {
    console.debug(myInfo);
    _p5.createCanvas(400, 400);
  };

  _p5.draw = () => {
    _p5.background(0);
    _p5.fill(255);
    _p5.strokeWeight(0);
    _p5.text(`welcome ${myInfo.name}`, 10, 30);
    _p5.text(`Class Rank: ${myInfo.classRank}`, 10, 50);

    const diffRange = 5;
    const ageMap = _p5.map(myInfo.age, 0, 100, 0 + diffRange, 255 - diffRange);
    const lineColor = ageMap + ((Math.random() * diffRange * 2) - diffRange);
    _p5.stroke(lineColor);
    _p5.strokeWeight(myInfo.age);
    _p5.line(0, _p5.height / 2, _p5.width, _p5.height / 2);
    _p5.fill(255 - lineColor);
    _p5.strokeWeight(0);
    _p5.text(myInfo.website, 10, _p5.height / 2);
  };
}
