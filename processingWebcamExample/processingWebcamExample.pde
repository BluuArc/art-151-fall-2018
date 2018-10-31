import processing.video.*;

Capture webcam, webcam2;
color trackingColor;
float colorThreshold = 0;
int offset = 0;
int direction = -1;

void setup() {
  size(640, 480);
  // webcam = new Capture(this, "name=Logitech Webcam C930e,size=960x540,fps=30"); // from Capture.list()
  webcam = new Capture(this, 640, 480, "Logitech Webcam C930e");
  // webcam2 = new Capture(this, 640, 480, "USB2.0 HD UVC WebCam");

  // printArray(Capture.list()); // lists all possible camera configs to use
  webcam.start();
  // webcam2.start();

  trackingColor = color(0, 0, 255);

  float maxThreshold = dist(0,0,0,255,255,255);
  colorThreshold = map(40, 0, 100, 0, maxThreshold);
}

void captureEvent (Capture c) {
  c.read();
  c.loadPixels();
}

void draw() {
  // loadPixels();
  // // println("pixels[0]: "+ red(pixels[0]));
  // for (int i = 0; i < (width * height); ++i) {
  //   float r = red(pixels[i]);
  //   float g = green(pixels[i]);
  //   float b = blue(pixels[i]);

  //   r = (r + offset) > 255 ? 0 : (r + offset);
  //   g = (g + offset) > 255 ? 0 : (g + offset);
  //   b = (b + offset) > 255 ? 0 : (b + offset);

  //   pixels[i] = color(r, g, b);
  // }
  // updatePixels();

  // image(webcam, 0, 0);
  background(255);

  ellipseMode(CENTER);
  fill(trackingColor);
  stroke(0, 0);

  // values from tracking color
  float rT = red(trackingColor);
  float gT = green(trackingColor);
  float bT = blue(trackingColor);

  float minX = 0;
  float maxX = 0;
  float minY = 0;
  float maxY = 0;
  float sumX = 0;
  float sumY = 0;
  int numMatches = 0;

  for (int x = 0; x < webcam.width; ++x) {
    for (int y = 0; y < webcam.height; ++y) {
      int location = x + (y * webcam.width);
      color currentColor = webcam.pixels[location];

      float r = currentColor >> 16 & 0xFF;
      float g = currentColor >> 8 & 0xFF;
      float b = currentColor & 0xFF;

      float colorDiff = dist(r, g, b, rT, gT, bT);
      if (colorDiff < colorThreshold) {
        maxX = max(maxX, x);
        minX = max(minX, x);
        maxY = max(maxY, y);
        minY = max(minY, y);
        numMatches++;
        sumX += x;
        sumY += y;
        ellipse(x, y, 5, 5);
      }

      // r = (r + offset) > 255 ? 0 : (r + offset);
      // g = (g + offset) > 255 ? 0 : (g + offset);
      // b = (b + offset) > 255 ? 0 : (b + offset);

      // webcam.pixels[location] = color(r, g, b);
    }
  }
  // image(webcam2, 640, 0);

  float triggerX = width / 2;
  float triggerY = height / 2;
  rectMode(CENTER);
  fill(255, 0, 0);
  rect(triggerX, triggerY, 50, 50);

  if (numMatches > 0) {
    fill(0);
    ellipse(sumX / numMatches, sumY / numMatches, 50, 50);

    if (dist(sumX / numMatches, sumY / numMatches, triggerX, triggerY) < 25) {
      background(0);
      textSize(20);
      text("Aghh", triggerX, triggerY);
    }
  }

  

  // bouncing offset
  // if (offset >= 255) {
  //   direction = -1;
  // } else if (offset <= 0) {
  //   direction = 1;
  // }
  // offset += direction;
}
