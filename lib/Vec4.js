class Vec4 {
  static from(v) {
    return new Vec4(v.x, v.y, v.z, v.w);
  }

  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.set(x, y, z, w);
  }
  setv({ x, y, z, w = 1}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  set(x, y, z, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  clone() {
    return new Vec4.from(this);
  }
}
export default Vec4;
