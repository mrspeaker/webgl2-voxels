import m4 from "../lib/m4.js";
import Transform from "../lib/Transform.js";

class Camera {
  constructor(gl, fov = 45, near = 0.1, far = 300.0) {
    const aspect = gl.canvas.width / gl.canvas.height;
    this.projectionMatrix = m4.perspective(fov, aspect, near, far);
    this.transform = new Transform();
    this.view = m4.identity();
    this.mode = Camera.MODE_ORBIT;
  }

  updateViewMatrix() {
    const { transform } = this;
    const { position, rotation, view } = transform;

    m4.identity(view);
    if (this.mode === Camera.MODE_FREE) {
      m4.translate(view, position.x, position.y, position.z, view);
      m4.yRotate(view, rotation.y * Transform.deg2Rad, view);
      m4.xRotate(view, rotation.x * Transform.deg2Rad, view);
    } else {
      m4.yRotate(view, rotation.y * Transform.deg2Rad, view);
      m4.xRotate(view, rotation.x * Transform.deg2Rad, view);
      m4.translate(view, position.x, position.y, position.z, view);
    }
    transform.updateDirection();
    m4.inverse(view, this.view);

    return this.view;
  }

  panX(v) {
    const { mode, transform } = this;
    if (mode === Camera.MODE_ORBIT) return;
    this.updateViewMatrix();
    transform.position.x += transform.right[0] * v;
    transform.position.y += transform.right[1] * v;
    transform.position.z += transform.right[2] * v;
  }

  panY(v) {
    const { mode, transform } = this;
    this.updateViewMatrix();
    transform.position.y += transform.up[1] * v;
    if (mode === Camera.MODE_ORBIT) return;
    transform.position.x += transform.up[0] * v;
    transform.position.z += transform.up[2] * v;
  }

  panZ(v) {
    const { mode, transform } = this;
    this.updateViewMatrix();
    if (mode === Camera.MODE_ORBIT) {
      transform.position.z += v;
    } else {
      transform.position.x += transform.forward[0] * v;
      transform.position.y += transform.forward[1] * v;
      transform.position.z += transform.forward[2] * v;
    }
  }
}

Camera.MODE_FREE = 0;
Camera.MODE_ORBIT = 1;

export default Camera;
