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

  clone() {
    return new Vec3.from(this);
  }
}
export default Vec3;
