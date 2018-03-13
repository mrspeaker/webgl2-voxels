import Transform from "../lib/Transform.js";

class Model {
  constructor (mesh) {
    this.transform = new Transform();
    this.mesh = mesh;
  }

  setPosition(x, y, z) {
    this.transform.position.set(x, y, z);
    return this;
  }

  setRotation(x, y, z) {
    this.transform.rotation.set(x, y, z);
    return this;
  }

  setScale(x, y = x, z = x) {
    this.transform.scale.set(x, y, z);
    return this;
  }

  addPosition(x, y, z) {
    this.transform.position.add(x, y, z);
    return this;
  }

  addRotation(x, y, z) {
    this.transform.rotation.add(x, y, z);
    return this;
  }

  addScale(x, y = x, z = y) {
    this.transform.scale.add(x, y, z);
    return this;
  }

  preRender() {
    this.transform.updateMatrix();
    return this;
  }

}

export default Model;
