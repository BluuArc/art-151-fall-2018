'use strict';
function App (_p5) {
  let capture;
  let w = 640, h = 480;
  let tracker;
  let firstStart = true;
  let prevAvg = 0;
  let mask;

  _p5.preload = () => {
    mask = _p5.loadImage('./tiger.png');
  }

  _p5.setup = () => {
    _p5.createCanvas(640, 480);
    capture = _p5.createCapture({
      audio: false,
      video: { width: w, height: h },
    });
    capture.size(640, 480);
    capture.hide();

    _p5.colorMode(_p5.HSB);

    tracker = new clm.tracker();
    tracker.init();
    tracker.start(capture.elt);

    console.debug(tracker.getCurrentPosition());
  }

  _p5.draw = () => {
    _p5.image(capture, 0, 0, w, h);

    const positions = tracker.getCurrentPosition();
    if (!positions) {
      return;
    }

    if (firstStart) {
      console.debug(positions);
      firstStart = !firstStart;
    }

    _p5.noFill();
    _p5.stroke(255);
    _p5.beginShape();
    positions.forEach(([x, y]) => _p5.vertex(x, y));
    _p5.endShape();

    _p5.noStroke();
    positions.forEach(([x, y], i) => {
      _p5.fill(_p5.map(i, positions.length, 0, 360), 50, 100);
      _p5.ellipse(x, y, 4, 4);
      _p5.text(i, x, y);
    });

    if (positions.length > 0) {
      const mouthLeft = _p5.createVector(positions[44][0], positions[44][1]);
      const mouthRight = _p5.createVector(positions[50][0], positions[50][1]);
      const smile = mouthLeft.dist(mouthRight);
      _p5.rect(20, 20, smile * 3, 20);
      if (prevAvg === 0) {
        prevAvg = smile;
      } else {
        // weighted average
        prevAvg = prevAvg * 0.9 + smile * 0.1;
      }
      console.debug(prevAvg, Math.abs(smile - prevAvg));

      const width = positions[12][0] - positions[2][0];
      const height = positions[7][1] - positions[20][1];
      _p5.image(mask, positions[62][0] - width / 2, positions[62][1] - height / 2, width, height);
    }
  }
}
