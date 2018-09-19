'use strict';
function App (_p5) {

  let canvas, bgColor;
  let userName, colorButton, paragraph, textInput;
  let ellipseSlider;

  _p5.setup = () => {
    canvas = _p5.createCanvas(_p5.windowWidth, _p5.windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', -1);
    bgColor = 200;
    _p5.background(bgColor);

    userName = _p5.createElement('h1', 'Joshua Castor');
    userName.position(100, 10);

    colorButton = _p5.createButton("Change Color");
    colorButton.mouseClicked(changeColor);

    paragraph = _p5.createP("This is a paragraph");
    paragraph._pInst = _p5;
    paragraph.mouseOver(() => ellipseSlider.value(_p5.random(50, 550)));

    textInput = _p5.createInput("Type your name here.");
    textInput.input(updateFontColor);
    textInput.changed(updateName);

    _p5.createElement('br');
    ellipseSlider = _p5.createSlider(0, 600, 300);
  }

  function updateName () {
    userName.html(textInput.value());
  }

  function changeColor () {
    bgColor = _p5.color(_p5.random(255));
  }

  function updateFontColor () {
    paragraph.style("color", _p5.color(_p5.random(255), _p5.random(255), _p5.random(255)).toString());
    userName.style("color", _p5.color(_p5.random(255), _p5.random(255), _p5.random(255)).toString());
  }

  // everything here positioned relative to canvas
  _p5.draw = () => {
    _p5.background(bgColor);
    _p5.text(textInput.value(), 50, 100);
    _p5.ellipse(_p5.width / 2, _p5.height / 2, ellipseSlider.value());
    
    if (ellipseSlider.value() > 400) {
      _p5.fill(0, 255, 0);
      userName.hide();
    } else {
      userName.show();
      userName.position(ellipseSlider.value(), 10);
      _p5.fill(255, 0, 0);
    }
  }
}
