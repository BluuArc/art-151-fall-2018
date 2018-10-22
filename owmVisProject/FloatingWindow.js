class FloatingWindow {
  constructor (_p5) {
    this._p5 = _p5;
    this._elem = this._p5.createElement('div');
    this._content = this._p5.createElement('div');

    // setup tooltip
    this._elem.class('tooltip');

    this._toolbar = this._p5.createElement('div');
    this._toolbar.class('tooltip--toolbar');
    this._toolbar.parent(this._elem);

    const minimizeButton = this._p5.createButton('X');
    minimizeButton.mouseClicked(() => {
      this._elem.hide();
    });
    minimizeButton.parent(this._toolbar);

    this._content.parent(this._elem);
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
    window._elem = elem;
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
    window._elem = elem;
    const result = (
      (mouseX >= x - outerPadding && mouseX <= (x + elem.elt.offsetWidth + outerPadding)) &&
      (mouseY >= y - outerPadding && mouseY <= (y + elem.elt.offsetHeight + outerPadding))
    );
    return this.isVisible && this._p5.mouseIsPressed && result;
  }
}
