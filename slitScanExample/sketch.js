'use strict';
function App (_p5) {
  let capture;
  let w, h;
  let x = 0;
  _p5.setup = () => {
    _p5.createCanvas(640, 480);
    capture = _p5.createCapture(_p5.VIDEO);
    capture.size(480, 480);
    capture.hide();
  }


  function scan (offset = 1) {
    _p5.copy(
      capture, // source
      w / 2, 0, // position
      1, h, // 1 column
      (x + offset) > h ? (x + offset - h) : (x + offset), 0, // destination position
      1, h, // 1 column
    );
  }

  _p5.draw = () => {
    w = capture.width;
    h = capture.height;
    capture.loadPixels();
    // _p5.background(255);

    for (let i = 0; i < Math.floor(w * 0.1); ++i) {
      scan(i);
    }

    x += Math.max(Math.floor(w * 0.01), 1);
    if (x > w) {
      x = 0;
    }
    // _p5.image(capture, 0, 0);
  }
}
