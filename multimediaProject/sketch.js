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
  

  _p5.preload = async () => {
    poseNet = await posenet.load(0.5);
  };

  _p5.setup = () => {
    console.debug('entered setup');
    uiElements.canvas = _p5.createCanvas(captureDimensions.width * 2, captureDimensions.height);
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
    });
    uiElements.capture.hide();
  };

  async function updatePoseData () {
    const result = await poseNet.estimateSinglePose(
      uiElements.capture.elt,
      0.5, // imageScaleFactor
      true, // isFlippedHorizontally
      16, // outputStride
    );

    const relevantParts = ['leftWrist', 'rightWrist'];
    const relevantResults = result.keypoints.filter(entry => relevantParts.includes(entry.part));
    poseData = {
      leftWrist: relevantResults.find(e => e.part === 'leftWrist'),
      rightWrist: relevantResults.find(e => e.part === 'rightWrist'),
    };
    console.debug(result, poseData);
  }

  window.updatePoseData = updatePoseData;


  _p5.draw = () => {
    _p5.background(0);
    _p5.push();
    _p5.translate(captureDimensions.width, 0);
    _p5.scale(-1, 1);
    _p5.image(uiElements.capture, 0, 0, captureDimensions.width, captureDimensions.height);
    _p5.pop();

    if (poseData) {
      _p5.fill(255);
      _p5.ellipse(poseData.leftWrist.position.x, poseData.leftWrist.position.y, 50, 50);
      _p5.ellipse(poseData.rightWrist.position.x, poseData.rightWrist.position.y, 50, 50);
    }
  };
}
