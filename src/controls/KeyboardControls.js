class KeyboardControls {
  constructor(canvas) {
    this.keys = {};
    const doc = canvas.ownerDocument;
    doc.addEventListener("keydown", this.onKeyDown.bind(this), false);
    doc.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  onKeyDown(e) {
    this.keys[e.which] = true;
  }

  onKeyUp(e) {
    this.keys[e.which] = false;
  }

  isDown(key) {
    return this.keys[key];
  }
}

export default KeyboardControls;
