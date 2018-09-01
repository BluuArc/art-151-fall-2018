new p5();

const bottomOffset = 7.5;
let iconSize = 10;
let iconY = 0;
const toolbarTextSize = 32;
let activeName;
let toobarBackgroundColor = color(175);
let toolbarY = 0;
let maxBrushSize = 30;
let taperedBrushSize = 0;
const backgroundColor = color(255);
const toolbarIconNames = ["pencil", "brush", "bucket", "eraser"];
let toolbarIcons = [];
let cursor;
let sizeSlider;
let strokeWidthSlider;
let paintSliders = [];
let strokeColorSliders = [];

function ToolbarIcon (inputName = '', shortcut) {
  this._name = inputName;
  this._shortcutKey = shortcut || inputName[0];
  this._x = 0;
  this._y = 0;

  this.draw = (inputX = this._x, inputY = this._y) => {
    this._x = inputX;
    this._y = inputY;
    this.changeActiveTool();
    stroke(0);
    strokeWeight(this.isActiveTool() ? 2 : 1);
    fill(this.mouseIsInIcon() ? (255 * 4 / 5) : (255 * 2 / 3));
    rectMode(CORNER);
    rect(this._x, this._y, iconSize, iconSize);

    textSize(toolbarTextSize);
    fill(this.isActiveTool() ? (255 / 4) : 0);
    const label = `${this._name} (${this._shortcutKey})`;
    text(label, this._x, this._y + toolbarTextSize);
  };

  this.mouseIsInIcon = () => {
    return (mouseX >= this._x && mouseX <= (this._x + iconSize))
      && (mouseY >= this._y && mouseY <= (this._y + iconSize));
  }

  this.shortcutKeyPressed = () => {
    return keyIsPressed && key === this._shortcutKey;
  }

  this.isActiveTool = () => {
    return activeName === this._name;
  }

  this.changeActiveTool = () => {
    if ((mouseIsPressed && this.mouseIsInIcon()) || this.shortcutKeyPressed()) {
      activeName = this._name;
    }
  }
}

function Cursor () {
  this._size = 5;
  this._strokeWeight = 1;
  this._paintColor = color(255/2);
  this._strokeColor = color(0);

  this.draw = (x = mouseX, y = mouseY) => {
    stroke(this._strokeColor);
    fill(this._paintColor);
    strokeWeight(this._strokeWeight);
    switch (activeName) {
      case "bucket":
        rectMode(CORNER);
        stroke(this._paintColor);
        strokeWeight(0);
        rect(0, 0, width, toolbarY);
        break;
      case "brush":
        ellipseMode(CENTER);
        ellipse(x, y, this._size, this._size);
        taperedBrushSize = this._size;
        break;
      case "eraser":
        fill(backgroundColor);
        strokeWeight(0);
        stroke(backgroundColor);
      case "pencil":
      default :
        rectMode(CENTER);
        rect(x, y, this._size, this._size);
    }
  }

  this.setSize = (newValue) => {
    this._size = newValue;
  }

  this.setStrokeWeight = (weight) => {
    this._strokeWeight = weight;
  }

  this.setColor = (red, green, blue, alpha) => {
    this._paintColor = color(red, green, blue, alpha);
  }

  this.setStrokeColor = (red, green, blue, alpha) => {
    this._strokeColor = color(red, green, blue, alpha);
  }
}

function Slider (min = 0, max = 100, maxWidth = 50, inputName = 'Slider') {
  this._minValue = min;
  this._maxValue = max;
  this._currentValue = this._minValue;
  this._name = inputName;
  this._maxWidth = maxWidth;
  this._x = 0;
  this._y = 0;

  this.draw = (inputX, inputY) => {
    this._x = inputX;
    this._y = inputY;
    textSize(toolbarTextSize * 0.85);
    fill(0);
    stroke(0);
    strokeWeight(1);
    const label = `${this._name}: ${Math.floor(this.getCurrentValue())}`;
    text(label, this._x, this._y - (toolbarTextSize * 0.15));
    rectMode(CORNER);
    fill(255);
    rect(this._x, this._y, this._maxWidth, toolbarTextSize);

    fill(0);
    rect(this._x, this._y, this._maxWidth * this.getCurrentRatio(), toolbarTextSize);

    if (mouseIsPressed && this.mouseIsInSlider()) {
      this.setValueBasedOnMouse();
    }
  }

  this.mouseIsInSlider = () => {
    return (mouseX >= this._x && mouseX <= this._x + this._maxWidth)
      && (mouseY >= this._y && mouseY <= this._y + toolbarTextSize);
  }

  this.setValueBasedOnMouse = () => {
    const distFromZero = mouseX - this._x;
    const ratio = distFromZero / this._maxWidth;
    this.setCurrentValue(ratio * this._maxValue);
  }

  this.setCurrentValue = (newValue = 0) => {
    if (newValue >= this._maxValue) {
      this._currentValue = this._maxValue;
    } else if (newValue <= this._minValue) {
      this._currentValue = this._minValue;
    } else {
      this._currentValue = newValue;
    }
  }

  this.getCurrentRatio = () => { // range: 0 - 1
    return this._currentValue / this._maxValue;
  }

  this.getCurrentValue = () => {
    return this._currentValue;
  }
}

function ColorSlider (width, colorName, inputColor) {
  this._baseSlider = new Slider(0, 255, width, colorName);
  this._barColor = inputColor;

  this.mouseIsInSlider = this._baseSlider.mouseIsInSlider;
  this.setValueBasedOnMouse = this._baseSlider.setValueBasedOnMouse;
  this.setCurrentValue = this._baseSlider.setCurrentValue;
  this.getCurrentRatio = this._baseSlider.getCurrentRatio;
  this.getCurrentValue = this._baseSlider.getCurrentValue;

  this.draw = (inputX, inputY) => {
    this._baseSlider._x = inputX;
    this._baseSlider._y = inputY;
    const barHeight = toolbarTextSize * 0.75;
    stroke(0);
    strokeWeight(1);

    rectMode(CORNER);
    fill(255);
    rect(this._baseSlider._x, this._baseSlider._y, this._baseSlider._maxWidth, barHeight);

    fill(this._barColor);
    const filledBarWidth = this._baseSlider._maxWidth * this.getCurrentRatio();
    rect(this._baseSlider._x, this._baseSlider._y, filledBarWidth, barHeight);

    textSize(barHeight);
    fill(0);
    const label = `${this._baseSlider._name[0]}: ${Math.floor(this.getCurrentValue())}`;
    text(label, this._baseSlider._x + filledBarWidth, this._baseSlider._y + barHeight);

    if (mouseIsPressed && this.mouseIsInSlider()) {
      this.setValueBasedOnMouse();
    }
  };
}

function setupToolbarIcons (iconInfo = toolbarIconNames) {
  return iconInfo.map(name => new ToolbarIcon(name, name === 'bucket' ? name[1] : name[0]));
}

function setupSliders() {
  sizeSlider = new Slider(1, iconSize * 0.75, iconSize, "Size");
  sizeSlider.setCurrentValue(50);
  strokeWidthSlider = new Slider(0, 50, iconSize, "Stroke");
  strokeWidthSlider.setCurrentValue(0);

  const paintConfig = [
    {
      name: 'Red',
      color: color(255, 0, 0),
      default: 50,
    },
    {
      name: 'Green',
      color: color(0, 255, 0),
      default: 50,
    },
    {
      name: 'Blue',
      color: color(0, 0, 255),
      default: 50,
    },
    {

      name: 'Alpha',
      color: color(0),
      default: 255,
    },
  ];
  const strokeConfig = paintConfig.map((entry) => ({
    name: entry.name,
    color: entry.color,
    default: entry.name === 'Alpha' ? 255 : 0,
  }));
  const sliderSize = iconSize * 0.75;
  paintSliders = paintConfig.map(entry => {
    const slider = new ColorSlider(sliderSize, entry.name, entry.color)
    slider.setCurrentValue(entry.default);
    return slider;
  });

  strokeColorSliders = strokeConfig.map(entry => {
    const slider = new ColorSlider(sliderSize, entry.name, entry.color)
    slider.setCurrentValue(entry.default);
    return slider;
  });
}

function setup () {
  createCanvas(1960, 1280);
  background(backgroundColor);
  iconSize = width * 0.1;
  activeName = toolbarIconNames[0];
  toolbarY = height - 2 * bottomOffset - iconSize;
  maxBrushSize = iconSize * 0.75;
  iconY = height - bottomOffset - iconSize;

  toolbarIcons = setupToolbarIcons();
  cursor = new Cursor();

  setupSliders();
}

function drawIconBar() {
  const leftOffset = (width / 2) - (toolbarIcons.length * iconSize / 2); // centered icon bar
  toolbarIcons.forEach((icon, i) => {
    // coords are top left of icon bar
    const x = leftOffset + (i * iconSize);
    icon.draw(x, iconY);
  });
}

function drawBrushPreview () {
  rectMode(CORNER);
  fill(255);
  rect(0, iconY, iconSize, iconSize);

  if (activeName === 'bucket') {
    activeName = 'pencil';
    cursor.draw(iconSize / 2, iconY + iconSize / 2);
    activeName = 'bucket';
  } else if (activeName !== 'brush') {
    cursor.draw(iconSize / 2, iconY + iconSize / 2);
  } else {
    const oldTaper = taperedBrushSize;
    cursor.setSize(sizeSlider.getCurrentValue());
    cursor.draw(iconSize / 2, iconY + iconSize / 2);
    taperedBrushSize = oldTaper;
  }

  const labelTextSize = toolbarTextSize * 0.75;
  textSize(labelTextSize);
  fill(0);
  stroke(0);
  strokeWeight(1);
  text('Brush Preview', 0, iconY + labelTextSize);
}

function drawSliders () {
  sizeSlider.draw(iconSize * 1.25, toolbarY + toolbarTextSize);
  strokeWidthSlider.draw(iconSize * 1.25, toolbarY + toolbarTextSize * 3);

  const iconbarEdge = width / 2 + (toolbarIcons.length * iconSize / 2);
  let paintSlidersOffsetX = iconbarEdge + iconSize / 4;
  textSize(toolbarTextSize);
  fill(0);
  stroke(0);
  strokeWeight(1);
  text("Paint Color", paintSlidersOffsetX, toolbarY + toolbarTextSize);
  paintSliders.forEach((slider, i) => {
    slider.draw(paintSlidersOffsetX, toolbarY + toolbarTextSize * (1.25 * (i + 1)));
  });

  paintSlidersOffsetX += iconSize * 1.25; // to the right of paint color selector
  textSize(toolbarTextSize);
  fill(0);
  stroke(0);
  strokeWeight(1);
  text("Stroke Color", paintSlidersOffsetX, toolbarY + toolbarTextSize);
  strokeColorSliders.forEach((slider, i) => {
    slider.draw(paintSlidersOffsetX, toolbarY + toolbarTextSize * (1.25 * (i + 1)));
  });
}

function drawToolbar () {
  stroke(0);
  strokeWeight(1);
  fill(toobarBackgroundColor);
  rectMode(CORNER);
  rect(0, toolbarY, width, iconSize + 2 * bottomOffset);

  drawBrushPreview();

  stroke(0);
  strokeWeight(1);
  drawIconBar();
  drawSliders();
}

function mouseIsInToolbar() {
  return mouseY >= toolbarY;
}

function draw () {
  if (!mouseIsInToolbar()) {
    if (mouseIsPressed) {
      cursor.draw();
    } else if (activeName === 'brush' && !mouseIsPressed && taperedBrushSize > 0) {
      cursor.setSize(taperedBrushSize);
      cursor.draw();
      taperedBrushSize -= taperedBrushSize * 0.25;
      if (taperedBrushSize < 5) {
        taperedBrushSize = 0; // prevent super small trailing dots
      }
    }
  }
  drawToolbar();

  cursor.setSize(sizeSlider.getCurrentValue());
  cursor.setStrokeWeight(strokeWidthSlider.getCurrentValue());
  cursor.setColor(paintSliders[0].getCurrentValue(), paintSliders[1].getCurrentValue(), paintSliders[2].getCurrentValue(), paintSliders[3].getCurrentValue());
  cursor.setStrokeColor(strokeColorSliders[0].getCurrentValue(), strokeColorSliders[1].getCurrentValue(), strokeColorSliders[2].getCurrentValue(), strokeColorSliders[3].getCurrentValue());
}
