'use strict';
function App (_p5) {

  let canvas;

  // screen text
  let title, firstOption, secondOption, greeting, userName;

  // inputs
  let nameInput;

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

      firstOption = _p5.createP("walk towards the sun");
      firstOption._pInst = _p5;
      secondOption = _p5.createP("go home");
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
    },
    closerToSun () {
      currentScene = 'walkCloser';
    },
    toHome () {
      firstOption.hide();
      secondOption.hide();

      title.html('you have gone home. good night.');
    },
    sunAnimate () {

    },
  };

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

  _p5.draw = () => {
    if (currentScene === 'walkToSun') {
      drawToSunAnimation();
    } else if (currentScene === 'walkCloser') {
      
    }
  }

  // _p5.windowResized = () => {

  // }
}
