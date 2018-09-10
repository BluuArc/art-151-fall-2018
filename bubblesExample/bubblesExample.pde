class Bubble {
  int x;
  int y;
  float xSpeed;
  float ySpeed;
  final int size = 50;

  public Bubble() {
    this(0, 0, 0, 0);
  }

  public Bubble (int inX, int inY, float inXSpeed, float inYSpeed) {
    this.x = inX;
    this.y = inY;
    this.xSpeed = inXSpeed;
    this.ySpeed = inYSpeed;
  }

  public void draw () {
    ellipseMode(CENTER);
    stroke(255);
    fill(0);

    ellipse(this.x, this.y, this.size, this.size);

    updatePhysics();
  }

  private boolean mouseIsNear () {
    float range = size * 5;
    return Math.abs(mouseX - this.x) < range && Math.abs(mouseY - this.y) < range;
  }

  private void updatePhysics () {
    if (this.x >= width - size / 2) {
      this.xSpeed = -Math.abs(this.xSpeed);
    } else if (this.x <= size / 2) {
      this.xSpeed = Math.abs(this.xSpeed);
    }

    if (this.y >= height - size / 2) {
      this.ySpeed = -Math.abs(this.ySpeed);
    } else if (this.y <= size / 2) {
      this.ySpeed = Math.abs(this.ySpeed);
    }

    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (mouseIsNear() && mousePressed) {
      float changeX = Math.max(this.xSpeed * 0.5, 1);
      float changeY = Math.max(this.ySpeed * 0.5, 1);
      this.xSpeed += (mouseX < this.x) ? -changeX : changeX;
      this.ySpeed += (mouseY < this.y) ? -changeY : changeY;
    }
  }
}

int numShapes = 100;
Bubble[] bubbles = new Bubble[numShapes];

void setup () {
  size(displayWidth, displayHeight);
  // float speedLimit = width * 0.25;
  float speedLimit = 2;
  for (int i = 0; i < numShapes; ++i) {
    bubbles[i] = new Bubble((int)random(26, width - 26), (int)random(26, height - 26), random(-speedLimit, speedLimit), random(-speedLimit, speedLimit));
  }

  smooth();
}

void draw () {
  background(0);
  for (int i = 0; i < numShapes; ++i) {
    bubbles[i].draw();
  }
}
