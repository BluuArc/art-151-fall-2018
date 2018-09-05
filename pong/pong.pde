class Ball {
  public int ballWidth = 40;
  public int ballHeight = 40;
  public float x;
  public float y;
  public float xSpeed;
  public float ySpeed;
  public final float maxSpeed = 100;
  private int snapFrames = 0;

  public Ball (int sizeX, int sizeY, float inputSpeedX, float inputSpeedY, float inputX, float inputY) {
    this.ballWidth = sizeX;
    this.ballHeight = sizeY;
    this.x = inputX;
    this.y = inputY;
    this.xSpeed = inputSpeedX;
    this.ySpeed = inputSpeedY;
  }

  public Ball () {
    this(40, 40, 30, 30, random(21, width - 21), random(21, height / 2));
  }

  public void reset () {
    this.x = random(21, width - 21);
    this.y = random(21, height / 2);
    this.xSpeed = random(-maxSpeed, maxSpeed);
    this.ySpeed = random(-maxSpeed, maxSpeed);
  }

  private void updatePhysics () {
    if (x > width - ballWidth/2 || x < ballWidth / 2) {
      xSpeed *= -1;
    }
    if (y < ballHeight / 2) {
      ySpeed *= -1;
    }
    ySpeed = (ySpeed > 0) ?  Math.min(maxSpeed, ySpeed) : Math.max(-maxSpeed, ySpeed);

    x += xSpeed;
    y += ySpeed;

    if (random(0, 1) > 0.99) {
      this.x = random(21, width - 21);
      this.y = random(21, height / 2);
      snapFrames += 5;
    }
  }

  public void drawSnapFrames () {
    if (snapFrames > 0) {
      textSize(100);
      fill(255);
      text("SNAP", width / 2, height / 2);
      snapFrames--;
    }
  }

  public void draw () {
    drawSnapFrames();
    fill(255);
    noStroke();
    ellipseMode(CENTER);
    ellipse(x, y, ballWidth, ballHeight);
    updatePhysics();
  }

  boolean isAtBottom () {
    return y > height;
  }
}

class Paddle {
  public int paddleWidth = 400;
  public int paddleHeight = 50;

  void draw () {
    rectMode(CENTER);

    rect(mouseX, height - paddleHeight, paddleWidth, paddleHeight);
  }

  boolean yCoordIsInPaddle (float y) {
    return y >= height - paddleHeight; // && y <= (height + paddleHeight);
  }

  boolean xCoordIsInPaddle (float x) {
    return x >= mouseX - paddleWidth/2 && x <= mouseX + paddleWidth/2;
  }

  void reset () {
    paddleWidth = width;
  }
}


class ScoreCounter {
  public int counter = 0;

  public void draw () {
    textSize(40);
    fill(255);
    noStroke();

    text("Score: " + counter, 20, 40);
  }

  public void checkIfIncrementCounter (Ball ball, Paddle paddle) {
    if (ballIsInPaddle(ball, paddle)) {
      counter += 1;
      ball.ySpeed *= -2;
      paddle.paddleWidth = (int)Math.max(paddle.paddleWidth * 0.9, 70);
    }
  }

  boolean ballIsInPaddle (Ball ball, Paddle paddle) {
    boolean xCoordCheck = paddle.xCoordIsInPaddle(ball.x + ball.ballWidth / 2) || paddle.xCoordIsInPaddle(ball.x - ball.ballWidth / 2);
    return paddle.yCoordIsInPaddle(ball.y + ball.ballHeight / 2) && xCoordCheck;
  }

  void reset () {
    counter = 0;
  }
}

Ball ball;
Paddle paddle;
ScoreCounter scoreCounter;
void setup () {
  size(displayWidth, displayHeight);

  ball = new Ball();
  paddle = new Paddle();
  scoreCounter = new ScoreCounter();
}

void draw () {
  background(0);
  ball.draw();
  paddle.draw();
  scoreCounter.draw();
  scoreCounter.checkIfIncrementCounter(ball, paddle);

  if (ball.isAtBottom() && !scoreCounter.ballIsInPaddle(ball, paddle)) {
    scoreCounter.reset();
    ball.reset();
    paddle.reset();
  }
}
