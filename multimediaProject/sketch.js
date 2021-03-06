'use strict';
function App (_p5) {
  window._appP5 = _p5;
  const uiElements = {
    canvas: null,
    capture: null,
  };
  const captureDimensions = {
    width: 640,
    height: 480,
  };
  let poseNet;
  let poseData;
  const shooterGame = new SpaceShooter(captureDimensions.width, captureDimensions.height, false);
  window.shooterGame = shooterGame;
  let streamLoaded = false;

  _p5.preload = async () => {
    poseNet = await posenet.load(0.5);
  };

  _p5.setup = () => {
    console.debug('entered setup');
    uiElements.canvas = _p5.createCanvas(captureDimensions.width * 2, captureDimensions.height);
    uiElements.canvas.parent('canvas-container');
    uiElements.capture = _p5.createCapture({
      video: {
        mandatory: {
          minWidth: captureDimensions.width,
          minHeight: captureDimensions.height,
        },
      },
      audio: false,
    }, (stream) => {
      console.debug('stream loaded', stream);
      streamLoaded = true;
    });
    uiElements.capture.elt.width = captureDimensions.width;
    uiElements.capture.elt.height = captureDimensions.height;
    uiElements.capture.hide();
    _p5.frameRate(30);

    // add readme
    const readmeArea = document.querySelector('#readme');
    fetch('./README.md')
      .then(r => r.text())
      .then(marked)
      .then(data => {
        readmeArea.innerHTML = data;
        readmeArea.style.maxWidth = `${+uiElements.canvas.width}px`;
      });
    window.uiElements = uiElements;
  };

  async function updatePoseData () {
    const result = await poseNet.estimateSinglePose(
      uiElements.capture.elt,
      0.2, // imageScaleFactor (lower is faster, but less accurate)
      true, // isFlippedHorizontally
      16, // outputStride (higher is faster, but less accurate)
    );

    const relevantParts = ['leftShoulder', 'rightShoulder'];
    const relevantResults = result.keypoints.filter(entry => relevantParts.includes(entry.part));
    poseData = {
      leftPoint: relevantResults.find(e => e.part === 'leftShoulder'),
      rightPoint: relevantResults.find(e => e.part === 'rightShoulder'),
    };
    // console.debug(result, poseData);

    const convertedVector = pointsToPolarVector(
      [poseData.rightPoint.position.x, poseData.rightPoint.position.y],
      [poseData.leftPoint.position.x, poseData.leftPoint.position.y],
      false,
    );
    const turningAngle = Math.floor(convertedVector.degAngle);
    console.debug(turningAngle);

    if (Math.abs(turningAngle) <= 3) {
      shooterGame.toggleKey('left', false);
      shooterGame.toggleKey('right', false);
      shooterGame.toggleKey('speedUpTurn', false);
    } else {
      shooterGame.toggleKey('left', turningAngle < 0);
      shooterGame.toggleKey('right', turningAngle > 0);
      shooterGame.toggleKey('speedUpTurn', Math.abs(turningAngle) >= 15);
    }
  }
  window.updatePoseData = updatePoseData;

  const throttledUpdatePoseData = _.throttle(updatePoseData, 250);

  // from owmVisProject: https://github.com/BluuArc/castor-art-151-fall-2018/tree/master/owmVisProject
  function pointsToPolarVector (point1 = [], point2 = [], flipQuadrants = false) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const [xDiff, yDiff] = [x2 - x1, y2 - y1]; // point2 - point1
    let angle = xDiff !== 0 ? Math.atan(yDiff / xDiff) : 0; // in radians
    if (flipQuadrants) {
      angle -= Math.PI;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
    }
    return {
      size: Math.sqrt(xDiff * xDiff + yDiff * yDiff),
      angle,
      degAngle: angle * 180 / Math.PI,
    };
  }

  _p5.draw = () => {
    _p5.background(0);

    if (!streamLoaded) {
      _p5.fill(255);
      _p5.textSize(30);
      _p5.text('Waiting for stream to load', _p5.width / 2, _p5.height / 2);
      return;
    } else if (!poseData) {
      throttledUpdatePoseData();
      _p5.fill(255);
      _p5.textSize(30);
      _p5.text('Waiting for pose data to load', _p5.width / 2, _p5.height / 2);
      return;
    }

    // draw capture
    _p5.push();
    _p5.translate(captureDimensions.width, 0);
    _p5.scale(-1, 1);
    _p5.image(uiElements.capture, 0, 0, captureDimensions.width, captureDimensions.height);
    // uiElements.canvas.elt.getContext('2d').drawImage(uiElements.capture.elt, 0, 0, captureDimensions.width, captureDimensions.height);
    _p5.pop();

    // draw game
    shooterGame.draw();
    uiElements.canvas.elt.getContext('2d').drawImage(shooterGame.canvas, captureDimensions.width, 0, captureDimensions.width, captureDimensions.height);

    if (!shooterGame.isPaused && !shooterGame.isWaitingForReset) {
      throttledUpdatePoseData();
      // draw pose data
      if (poseData) {
        _p5.fill(255);
        _p5.stroke(255);
        // alternate letters to reflect mirrored camera
        _p5.text('R', poseData.leftPoint.position.x, poseData.leftPoint.position.y);
        _p5.text('L', poseData.rightPoint.position.x, poseData.rightPoint.position.y);
        _p5.line(
          poseData.leftPoint.position.x, poseData.leftPoint.position.y,
          poseData.rightPoint.position.x, poseData.rightPoint.position.y,
        );
      }
    }
  };
}
