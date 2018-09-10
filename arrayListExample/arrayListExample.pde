final int arraySize = 20;
ArrayList x, y;
PImage furby;

void setup () {
  size(displayWidth, displayHeight);

  x = new ArrayList();
  y = new ArrayList();
  furby = loadImage("furby.png");

  for (int i = 0; i < arraySize; ++i) {
    x.add(random(width));
    y.add(random(height));
  }

  imageMode(CENTER);
}

void draw () {
  background(82, 242, 255);
  int size = x.size();
  for (int i = 0; i < size; ++i) {
    float xValue = (float) x.get(i);
    float yValue = (float) y.get(i);

    fill(random(255));
    ellipse(xValue, yValue, 50, 50);

    image(furby, xValue, yValue, 40, 40);
  }
}

void mouseReleased () {
  x.add((float)mouseX);
  y.add((float)mouseY);
}

void keyPressed () {
  if (key == 'x' && x.size() > 0) {
    x.remove(0);
    y.remove(0);
  }
}
