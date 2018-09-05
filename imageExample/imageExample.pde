PImage furby;

int counter = 0;

boolean isFurbyBrush = false;
boolean isSquareBrush = false;

void setup () {
  size(displayWidth, displayHeight);
  // imageMode(CENTER);
  background(0);
  rectMode(CENTER);
  furby = loadImage("furby.png");
}

void draw () {
  fill(255);
  textSize(40);
  text("[Q]: Furby Brush [W]: Square Brush", 20, 40);
  
  if (isFurbyBrush) {
    furbyBrush();
  }

  if (isSquareBrush) {
    squareBrush();
  }

  counter++;
}

void furbyBrush () {
  image(furby, mouseX, mouseY);
}

void squareBrush () {
  pushMatrix(); // create a new "layer" to apply transformations
  translate(mouseX, mouseY);
  rotate(radians(counter));
  fill(8, 255, 0, 60);
  stroke(255, 8, 231, 60);
  rect(0, 0, mouseX, 20);
  popMatrix();
}

void keyPressed () {
  if (key == 'q' || key == 'Q') {
    isFurbyBrush = true;
    isSquareBrush = false;
  }

  if (key == 'w' || key == 'W') {
    isFurbyBrush = false;
    isSquareBrush = true;
  }

  // if (key == 's' || key == 'S') {
  //   // save("drawing.png"); // save as drawing.png, overwriting existing file
  //   saveFrame("drawing-######.png");
  // }
}
