'use strict';
function App (_p5) {
  window._appP5 = _p5;

  let astrosData;

  function getAstroData () {
    return fetch('http://api.open-notify.org/astros.json')
      .then(res => res.json());
  }

  function updateAstroData () {
    return getAstroData()
      .then(data => {
        console.debug(data);
        if (data && data.people) {
          astrosData = data.people.slice();
          astrosData.forEach(person => {
            person.x = _p5.random(0, _p5.width);
            person.y = _p5.random(0, _p5.height);
            person.xSpeed = _p5.random(-10, 10);
            person.ySpeed = _p5.random(-10, 10);
          });
          console.debug(astrosData);
        }
      });
  }

  _p5.setup = () => {
    _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    updateAstroData();
  };

  _p5.draw = () => {
    _p5.background(0);
    _p5.fill(255);
    _p5.strokeWeight(0);
    if (astrosData) {
      astrosData.forEach(person => {
        person.x = Math.min(_p5.width, Math.max(0, person.x + person.xSpeed));
        person.y = Math.min(_p5.height, Math.max(0, person.y + person.ySpeed));
        if ((person.x <= 0 && person.xSpeed < 0) || (person.x >= _p5.width && person.xSpeed > 0)) {
          person.xSpeed *= -1;
          person.xSpeed = Math.abs(_p5.random(-10, 10)) * Math.sign(person.xSpeed);
        }

        if ((person.y <= 0 && person.ySpeed < 0) || (person.y >= _p5.height && person.ySpeed > 0)) {
          person.ySpeed *= -1;
          person.ySpeed = Math.abs(_p5.random(-10, 10)) * Math.sign(person.ySpeed);
        }

        _p5.ellipse(person.x, person.y, 50, 50);
        _p5.text(person.name, person.x - 30, person.y - 30);
        window.astrosData = astrosData;
      });
    }
  };
}
