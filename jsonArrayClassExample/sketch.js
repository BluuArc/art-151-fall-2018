'use strict';
function App (_p5) {
  window._appP5 = _p5;

  let birdData;
  let quailData;
  let presidentialData

  _p5.preload = () => {
    // birdData = _p5.loadJSON('birds_north_america.json');
    presidentialData = _p5.loadJSON('us_presidents.json');
  };

  function printBirdData () {
    birdData.birds
      .slice()
      .sort((a, b) => a.family < b.family ? -1 : 1)
      .forEach(bird => {
        const h1 = _p5.createElement('h1', bird.family);
        h1._pInst = _p5;
        h1._isShowing = true;
        h1.style('cursor', 'pointer');
        const subElements = bird.members.map(member => _p5.createElement('p', member));
        h1.mousePressed(() => {
          h1._isShowing = !h1._isShowing;
          h1.style('color', h1._isShowing ? 'black' : 'grey');
          subElements.forEach(elem => {
            elem.style('display', h1._isShowing ? 'block' : 'none');
          });
        });
      });
  }

  function printPresidentialData () {
    const data = presidentialData.objects
      .slice()
      .sort((a, b) => new Date(a.startdate) - new Date(b.startdate));
    console.debug(data);
     data.forEach(president => {
        const h1 = _p5.createElement('h1', president.person.name);
        h1._pInst = _p5;
        h1._isShowing = true;
        h1.style('cursor', 'pointer');
        const subElements = Object.keys(president)
          .sort((a, b) => a < b ? -1 : 1)
          .filter(key => president[key] && typeof president[key] !== 'object')
          .map(key => {
            const text = `${key}: ${president[key]}`;
            return _p5.createP(text);
          });
        h1.mousePressed(() => {
          h1._isShowing = !h1._isShowing;
          h1.style('color', h1._isShowing ? 'black' : 'grey');
          subElements.forEach(elem => {
            elem.style('display', h1._isShowing ? 'block' : 'none');
          });
        });
      });
  }

  _p5.setup = () => {
    // quailData = birdData.birds.find(entry => entry.family === 'New World Quail');
    // console.debug(birdData);
    // console.debug(quailData);
    // _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    console.debug(presidentialData);
    _p5.noCanvas();
    printPresidentialData();
    // printBirdData();
  };

  _p5.draw = () => {
    _p5.background(0);
    _p5.fill(255);

    // print family name
    // _p5.textSize(60);
    // _p5.text(quailData.family, 20, 60);

    // print family members
    _p5.textSize(40);
    // quailData.members.forEach((name, index) => {
    //   _p5.text(name, 20, 100 + (40 * index));
    // });
  };
}
