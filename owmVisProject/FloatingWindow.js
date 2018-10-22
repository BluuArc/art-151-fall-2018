class FloatingWindow {
  constructor (_p5) {
    this._p5 = _p5;
    this._elem = this._p5.createElement('div');
    this.mouseInMinimizeButton = false;

    // setup tooltip
    this._elem.class('tooltip');

    this._toolbar = this._p5.createElement('div');
    this._toolbar.class('tooltip--toolbar');
    this._toolbar.parent(this._elem);

    this._minimizeButton = this._p5.createButton('X');
    this._minimizeButton.mouseOver(() => this.mouseInMinimizeButton = true);
    this._minimizeButton.mouseOut(() => this.mouseInMinimizeButton = false);
    this._minimizeButton.mouseClicked(() => {
      this._elem.hide();
    });
    this._minimizeButton.parent(this._toolbar);

    this._content = this._p5.createElement('div');
    this._content.parent(this._elem);

    this._title = this._p5.createElement('h1');
    this._title.html('Your Title');
    this._title.parent(this._content);

    this._description = this._p5.createElement('p');
    this._description.html('Your description');
    this._description.parent(this._content);

    this._footer = this._p5.createElement('div');
    this._footer.class('tooltip--footer');
    this._footer.parent(this._elem);
  }

  get elem () {
    return this._elem;
  }

  get contentElem () {
    return this._content;
  }

  get mouseInTooltip () {
    const elem = this.elem;
    const [mouseX, mouseY] = [this._p5.mouseX, this._p5.mouseY];
    const { x, y } = elem.position();
    // window._elem = elem;
    const result = (
      (mouseX >= x && mouseX <= (x + elem.elt.offsetWidth)) &&
      (mouseY >= y && mouseY <= (y + elem.elt.offsetHeight))
    );
    return result;
  }

  get isVisible () {
    return this.elem.elt.style.display !== 'none';
  }

  get toolbar () {
    return this._toolbar;
  }

  get isMovingWindow () {
    const outerPadding = 50;
    const elem = this._toolbar;
    const [mouseX, mouseY] = [this._p5.mouseX, this._p5.mouseY];
    const { x, y } = this.elem.position();
    // window._elem = elem;
    const result = (
      (mouseX >= x - outerPadding && mouseX <= (x + elem.elt.offsetWidth + outerPadding)) &&
      (mouseY >= y - outerPadding && mouseY <= (y + elem.elt.offsetHeight + outerPadding))
    );
    return this.isVisible && !this.mouseInMinimizeButton && this._p5.mouseIsPressed && result;
  }

  setContent (title, description, footer) {
    this._title.html(title);
    this._description.html(description);
    this._footer.html(footer);
  }
}
