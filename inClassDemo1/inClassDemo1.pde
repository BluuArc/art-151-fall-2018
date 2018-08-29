void setup () {
  size(1300, 800);
  background(144, 144, 144);

  for (int i = 0; i < height; i += 25) {
    line(0, i, width, i);
  }
}

int currentRotation = 0;
void draw () {
  if (mousePressed) {
    fill(144, 144, 144, 50);
    rect(0, 0, width, height); 
  } else if (keyPressed) {
    background(144);
  }
  


  int diffX = (mouseX - pmouseX < 0) ? (pmouseX - mouseX) : (mouseX - pmouseX);
  int diffY = (mouseY - pmouseY < 0) ? (pmouseY - mouseY) : (mouseY - pmouseY);
  // float magnitude = (float)Math.sqrt(diffX * diffX + diffY * diffY);
  float size = frameRate * 2.0;
  int minSize = 10;
  fill(255 - diffX, 255 - diffY, random(255));
  ellipse(mouseX, mouseY, Math.max(size - diffY, minSize), Math.max(size - diffX, minSize));
  // println(mouseX, mouseY);
  line(width/3, height/2, mouseX, mouseY);
  line(2 * width/3, height/2, pmouseX, pmouseY);
  
  pushMatrix(); // new layer for rotation
  translate(width / 2, height / 2);
  rotate(radians(currentRotation));
  triangle(0, -height / 5, width / 5, height / 5, -width / 5, height / 5);
  popMatrix();
  
  strokeWeight(10);
  point(mouseX, mouseY);
  strokeWeight(1);
  currentRotation += 5;
}

void mouseDragged () {
  rect(mouseX, mouseY, 50, 50);
}
