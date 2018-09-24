'use strict';
function App (_p5) {

  let canvas;
  let spaceBg;

  // screen text
  let title, firstOption, secondOption, greeting, userName;

  // inputs
  let nameInput;
  let sunSlider;

  // animation variables
  let sunX, sunY;

  // animation controls
  let currentScene = 'firstScreen';
  const scenes = {
    beginning () {
      _p5.background(0);
      greeting = _p5.createP('Please type your name and press enter');
      _p5.createElement('br');

      nameInput = _p5.createInput('Type your name');
      nameInput.changed(scenes.startStory);
    },
    startStory () {
      greeting.hide();
      nameInput.hide();

      userName = _p5.createElement('h1', nameInput.value());
      title = _p5.createElement('h1', 'Get home before the sun sets');

      firstOption = _p5.createA("#", "walk towards the sun");
      firstOption._pInst = _p5;
      secondOption = _p5.createA("#", "go home");
      secondOption._pInst = _p5;

      firstOption.mousePressed(scenes.walkToSun);
      secondOption.mousePressed(scenes.toHome);
    },
    firstScreen () {

    },
    walkToSun () {
      currentScene = 'walkToSun';
      userName.html(nameInput.value());
      title.html('You walk toward the sun, it gets bigger');
      firstOption.html('walk closer');
      secondOption.html('control the sun');

      firstOption.mousePressed(scenes.closerToSun);
    },
    closerToSun () {
      currentScene = 'walkCloser';

      userName.html(nameInput.value());
      title.html('You are very close to the sun');
      firstOption.html('Fly away');
      secondOption.html('Go home');

      if (!sunSlider) {
        sunSlider = _p5.createSlider(0, 255, 100);
      }
      sunSlider.show();
    },
    toHome () {
      firstOption.hide();
      secondOption.hide();

      title.html('you have gone home. good night.');
    },
    sunAnimate () {

    },
  };

  _p5.preload = () => {
    spaceBg = _p5.loadImage('images/space.png');
  }

  _p5.setup = () => {
    canvas = _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');

    scenes.beginning();
  }

  function drawToSunAnimation () {
    _p5.background(0);
    sunX = _p5.width / 2 + _p5.random(-5, 5);
    sunY = _p5.height / 2 + _p5.random(-3, 3);
    _p5.ellipse(sunX, sunY, 300, 300);
  }

  function drawCloserToSunAnimation () {
    _p5.background(spaceBg);
    _p5.image(spaceBg, 500, 600, 900, 50);

    const value = sunSlider.value();
    _p5.fill(value, 0, 0);
    _p5.ellipse(_p5.width / 2, _p5.height / 2, value, value);

    if (value > 200) {
      title.html('You are too close to the sun');
    } else {
      title.html('You are very close to the sun');
    }
  }

  _p5.draw = () => {
    if (currentScene === 'walkToSun') {
      drawToSunAnimation();
    } else if (currentScene === 'walkCloser') {
      drawCloserToSunAnimation();
    }
  }

  // _p5.windowResized = () => {

  // }
}
