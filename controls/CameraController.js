class CameraController {
  constructor(gl, camera) {
    this.canvas = gl.canvas;
    this.camera = camera;

    this.rotateRate = -200;
    this.panRate = 5;
    this.zoomRate = 200;

    const box = this.canvas.getBoundingClientRect();
    this.offsetX = box.left;
    this.offsetY = box.right;

    this.initX = 0;
    this.initY = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.x = 0;
    this.y = 0;

    this.isDown = false;

    // TODO: simplify this class with pointerlock.

    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    this.canvas.addEventListener(
      "mousewheel",
      this.onMouseWheel.bind(this),
      false
    );
    this.canvas.addEventListener(
      "DOMMouseScroll",
      this.onMouseWheel.bind(this),
      false
    );
  }

  getMouseVec2(e) {
    return { x: e.pageX - this.offsetX, y: e.pageY - this.offsetY };
  }

  onMouseDown(e) {
    this.initX = this.prevX = e.pageX - this.offsetX;
    this.initY = this.prevY = e.pageY - this.offsetY;
    this.isDown = true;
  }

  onMouseUp(e) {
    this.isDown = false;
  }

  onMouseMove(e) {
    if (!this.isDown) {
      //return;
    }
    const {
      camera,
      panRate,
      rotateRate,
      canvas,
      offsetX,
      offsetY,
      prevX,
      prevY
    } = this;
    const x = e.pageX - offsetX;
    const y = e.pageY - offsetY;
    const dx = e.movementX;// x - prevX; TODO: changed to pointerlock. cleanup.
    const dy = e.movementY;//y - prevY;

    if (!e.shiftKey) {
      camera.transform.rotation.y += dx * (rotateRate / canvas.width);
      camera.transform.rotation.x += dy * (rotateRate / canvas.height);
    } else {
      camera.panX(-dx * (panRate / canvas.width));
      camera.panY(dy * (panRate / canvas.width));
    }
    this.prevX = x;
    this.prevY = y;
  }

  onMouseWheel(e) {
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    this.camera.panZ(delta * (this.zoomRate / this.canvas.height));
  }
}

export default CameraController;
