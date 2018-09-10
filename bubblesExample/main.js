class Bubble {
  constructor (inX = 0, inY = 0, inXSpeed = 0, inYSpeed = 0) {
    this._x = inX;
    this._y = inY;
    this._xSpeed = inXSpeed;
    this._ySpeed = inYSpeed;
    this._size = 50;
  }

  draw (sketch, range = 0) {
    sketch.ellipseMode(sketch.CENTER);
    sketch.stroke(255);
    sketch.fill(0);

    sketch.ellipse(this._x, this._y, this._size, this._size);

    this._updatePhysics(sketch, range);
  }

  mouseIsNear (sketch, range = 0) {
    return Math.abs(sketch.mouseX - this._x) < range && Math.abs(sketch.mouseY - this._y) < range;
  }

  _updatePhysics(sketch, range = 0) {
    if (this._x >= sketch.width - this._size / 2) {
      this._xSpeed = -Math.abs(this._xSpeed);
    } else if (this._x <= this._size / 2) {
      this._xSpeed = Math.abs(this._xSpeed);
    }

    if (this._y >= sketch.height - this._size / 2) {
      this._ySpeed = -Math.abs(this._ySpeed);
    } else if (this._y <= this._size / 2) {
      this._ySpeed = Math.abs(this._ySpeed);
    }

    this._x += this._xSpeed;
    this._y += this._ySpeed;

    if (this.mouseIsNear(sketch, range) && sketch.mouseIsPressed) {
      const changeX = Math.max(this._xSpeed * 0.5, 1);
      const changeY = Math.max(this._ySpeed * 0.5, 1);
      this._xSpeed += (sketch.mouseX < this._x) ? -changeX : changeX;
      this._ySpeed += (sketch.mouseY < this._y) ? -changeY : changeY;
    }
  }
}

function App (sketch) {
  const numShapes = 100;
  const bubbles = [];
  let range = 50;

  sketch.setup = () => {
    sketch.createCanvas(sketch.displayWidth, sketch.displayHeight);
    const speedLimit = 2;
    for (let i = 0; i < numShapes; ++i) {
      const newBubble = new Bubble(
        sketch.random(26, sketch.width - 26),
        sketch.random(26, sketch.height - 26), 
        sketch.random(-speedLimit, speedLimit), 
        sketch.random(-speedLimit, speedLimit));
      bubbles.push(newBubble);
    }

    sketch.smooth();
  }

  sketch.draw = () => {
    sketch.background(0);
    sketch.fill(sketch.random(255), 255/2);
    sketch.noStroke();
    if (sketch.mouseIsPressed) {
      sketch.ellipse(sketch.mouseX, sketch.mouseY, range, range);
    }

    if (sketch.mouseIsPressed) {
      range += Math.min(range * 1.01, 10);
    } else if (range < 50) {
      range = 50;
    } else {
      range -= Math.max(range * 0.1, 1);
    }

    range = Math.min(range, sketch.height / 2);

    bubbles.forEach(bubble => {
      bubble.draw(sketch, range);
    });
  }
}

new p5(App);
