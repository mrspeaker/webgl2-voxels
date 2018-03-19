class Vec3 {
  static from(v) {
    return new Vec3(v.x, v.y, v.z);
  }

  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }

  addv({ x, y, z }) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  add(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  setv({ x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  scale(amount) {
    this.x *= amount;
    this.y *= amount;
    this.z *= amount;
    return this;
  }

  normalize() {
    const { x, y, z } = this;
    const d = Math.sqrt(x * x + y * y + z * z);
    this.x /= d;
    this.y /= d;
    this.z /= d;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  angleTo(v) {
    const theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
    return Math.acos(theta);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  clone() {
    return Vec3.from(this);
  }
}
export default Vec3;
