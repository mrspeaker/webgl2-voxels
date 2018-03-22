import m4 from "../vendor/m4.js";
import Vec3 from "./Vec3.js";

const vecZero = Object.freeze(new Vec3());
const vecOne = Object.freeze(new Vec3(1, 1, 1));

class Transform {
  constructor() {
    this.position = new Vec3();
    this.scale = new Vec3(1, 1, 1);
    this.rotation = new Vec3();
    this.view = m4.identity();
    this.normal = new Float32Array(9);
    this.forward = new Float32Array(4);
    this.up = new Float32Array(4);
    this.right = new Float32Array(4);
  }

  reset () {
    const { position, scale, rotation } = this;
    position.setv(vecZero);
    scale.setv(vecOne);
    rotation.setv(vecZero);
    return this;
  }

  updateMatrix() {
    const { view, position, scale, rotation } = this;
    m4.identity(view);
    m4.translate(view, position.x, position.y, position.z, view);
    m4.xRotate(view, rotation.x * Transform.deg2Rad, view);
    m4.zRotate(view, rotation.z * Transform.deg2Rad, view);
    m4.yRotate(view, rotation.y * Transform.deg2Rad, view);
    m4.scale(view, scale.x, scale.y, scale.z, view);

    this.updateDirection();
    return this;
  }

  updateDirection () {
    const { view } = this;
    m4.transformVector(view, [0, 0, 1, 0], this.forward);
    m4.transformVector(view, [0, 1, 0, 0], this.up);
    m4.transformVector(view, [1, 0, 0, 0], this.right);
    return this;
  }
}

Transform.deg2Rad = Math.PI / 180;

export default Transform;
