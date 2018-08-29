final float bottomOffset = height * 0.075;
float iconSize = 10;
float iconY = 0;
final float toolbarTextSize = 32;
String activeName;
float toolbarBackgroundShade = 175;
float toolbarY = 0;
float maxBrushSize = 30;

class ToolbarIcon {
  private String name;
  private float x = 0;
  private float y = 0;

  public ToolbarIcon (String inputName) {
    this.name = inputName;
  }

  void draw () {
    this.changeActiveTool();
    strokeWeight(this.isActiveTool() ? 5 : 1);
    fill(this.mouseIsInIcon() ? (255 * 4/5) : (255 * 2/3));
    rectMode(CORNER);
    rect(this.x, this.y, iconSize, iconSize);

    textSize(toolbarTextSize);
    fill(this.isActiveTool() ? (255 / 4) : 0);
    text(this.name, this.x, this.y + toolbarTextSize);
  }

  void draw (float inputX, float inputY) {
    this.x = inputX;
    this.y = inputY;
    this.draw();
  }

  boolean mouseIsInIcon () {
    return (mouseX >= this.x && mouseX <= (this.x + iconSize))
      && (mouseY >= this.y && mouseY <= (this.y + iconSize));
  }

  boolean isActiveTool () {
    return activeName == this.name;
  }

  void changeActiveTool () {
    if (mousePressed && this.mouseIsInIcon()) {
      activeName = this.name;
    }
  }
}

class Cursor {
  private float size = 5;
  private color paintColor = color(255, 255, 255);

  public Cursor () {}

  void draw () {
    this.draw(mouseX, mouseY);
  }

  void draw (float x, float y) {
    stroke(0);
    strokeWeight(1);
    switch (activeName) {
      case "pencil":
      default :
        rectMode(CENTER);
        fill(paintColor);
        strokeWeight(1);
        rect(x, y, size, size);
    }
  }

  void setSize (float newValue) {
    this.size = newValue;
  }
}

class Slider {
  private float maxValue = 100.0;
  private float minValue = 0.0;
  private float currentValue = 0.0;
  private String name = "Slider";
  private float maxWidth = 50;
  private float x = 0;
  private float y = 0;

  public Slider (float min, float max, float width, String inputName) {
    this.minValue = min;
    this.maxValue = max;
    this.maxWidth = width;
    this.name = inputName;
    this.currentValue = this.minValue;
  }

  void draw (float inputX, float inputY) {
    this.x = inputX;
    this.y = inputY;
    textSize(toolbarTextSize);
    fill(0);
    String label = this.name.concat(": ");
    text(label.concat(String.valueOf(Math.round(this.getCurrentValue()))), this.x, this.y);
    rectMode(CORNER);
    fill(255);
    rect(this.x, this.y, this.maxWidth, toolbarTextSize);

    fill(0);
    rect(this.x, this.y, this.maxWidth * this.getCurrentRatio(), toolbarTextSize);

    if (mousePressed && this.mouseIsInSlider()) {
      this.setValueBasedOnMouse();
    }
  }

  boolean mouseIsInSlider () {
    return (mouseX >= this.x && mouseX <= this.x + this.maxWidth)
      && (mouseY >= this.y && mouseY <= this.y + toolbarTextSize);
  }

  void setValueBasedOnMouse () {
    float distFromZero = mouseX - this.x;
    float ratio = distFromZero / this.maxWidth;
    this.setCurrentValue(ratio * this.maxValue);
  }

  void setCurrentValue (float newValue) {
    if (newValue >= this.maxValue) {
      this.currentValue = this.maxValue;
    } else if (newValue <= this.minValue) {
      this.currentValue = this.minValue;
    } else {
      this.currentValue = newValue;
    }
  }

  float getCurrentRatio () { // range: 0 - 1
    return this.currentValue / this.maxValue;
  }

  float getCurrentValue () {
    return currentValue;
  }
}

String[] toolbarIconNames = {"pencil", "brush", "bucket", "eraser"};
ToolbarIcon[] setupToolbarIcons (String[] iconInfo) {
  ToolbarIcon[] icons = new ToolbarIcon[iconInfo.length];
  for (int i = 0; i < iconInfo.length; ++i) {
    icons[i] = new ToolbarIcon(iconInfo[i]);
  }
  return icons;
}
ToolbarIcon[] toolbarIcons = setupToolbarIcons(toolbarIconNames);

Slider sizeSlider;
Cursor cursor = new Cursor();

void setup () {
  size(1960, 1280);
  background(255);
  line(width / 2, 0, width / 2, height);
  iconSize = width * 0.1;
  activeName = toolbarIconNames[0];
  toolbarY = height - 2 * bottomOffset - iconSize;
  maxBrushSize = iconSize * 0.75;
  iconY = height - bottomOffset - iconSize;
  sizeSlider = new Slider(1, iconSize * 0.75, iconSize, "Size");
}

void drawIconBar () {
  final float leftOffset = (width/2) - (toolbarIconNames.length * iconSize/2); // centered icon bar
  for (int i = 0; i < toolbarIcons.length; ++i) {
    // coords are top left of icon bar
    float x = leftOffset + (i * iconSize);
    toolbarIcons[i].draw(x, iconY);
  }
}

void drawFpsIndicator () {
  textSize(toolbarTextSize);
  fill(0);
  text(String.valueOf(Math.round(frameRate)).concat(" FPS"), iconSize * 1.25, toolbarY + toolbarTextSize);
}

void drawBrushPreview () {
  rectMode(CORNER);
  fill(255);
  rect(0, iconY, iconSize, iconSize);
  cursor.draw(iconSize / 2, iconY + iconSize / 2);

  final float labelTextSize = toolbarTextSize * 0.75;
  textSize(labelTextSize);
  fill(0);
  text("Brush Preview", 0, iconY + labelTextSize);
}

void drawSliders () {
  sizeSlider.draw(iconSize * 1.25, toolbarY + toolbarTextSize * 2);
}

void drawToolbar () {
  strokeWeight(1);
  fill(toolbarBackgroundShade);
  rectMode(CORNER);
  rect(0, toolbarY, width, iconSize + 2 * bottomOffset);
  drawFpsIndicator();
  drawBrushPreview();
  drawIconBar();
  drawSliders();
}

void draw () {
  if (mousePressed) {
    cursor.draw();
  }
  drawToolbar();

  cursor.setSize(sizeSlider.getCurrentValue());
}
