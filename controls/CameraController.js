class CameraController {
  constructor(gl, camera) {
    this.canvas = gl.canvas;
    this.camera = camera;

    this.rotateRate = -150;
    this.zoomRate = 200;

    const box = this.canvas.getBoundingClientRect();
    this.offsetX = box.left;
    this.offsetY = box.right;

    this.isDown = false;
    this.isRight = false;

    // TODO: simplify this class no we've added pointerlock.

    this.canvas.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
      false
    );
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    this.canvas.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
      false
    );
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
    this.canvas.addEventListener(
      "contextmenu",
      e => {
        e.preventDefault();
      },
      false
    );
  }

  getMouseVec2(e) {
    return { x: e.pageX - this.offsetX, y: e.pageY - this.offsetY };
  }

  onMouseDown(e) {
    this.isDown = true;
    this.isRight = e.which === 3;
  }

  onMouseUp() {
    this.isDown = false;
    this.isRight = false;
  }

  onMouseMove(e) {
    const { camera, rotateRate, canvas } = this;
    const dx = e.movementX;
    const dy = e.movementY;

    camera.transform.rotation.x += dy * (rotateRate / canvas.height);
    camera.transform.rotation.x = Math.max(
      -90,
      Math.min(90, camera.transform.rotation.x)
    );
    camera.transform.rotation.y += dx * (rotateRate / canvas.width);
  }

  onMouseWheel(e) {
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    this.camera.panZ(delta * (this.zoomRate / this.canvas.height));
  }
}

export default CameraController;
