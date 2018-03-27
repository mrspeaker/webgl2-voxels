import Model from "./Model.js";
import glUtils from "../../lib/glUtils.js";

class Cube {
  static create(gl, name = "Cube", w, h, d, x, y, z) {
    return new Model(Cube.createMesh(gl, name, w, h, d, x, y, z));
  }
  static createMesh(
    gl,
    name,
    width = 1,
    height = 1,
    depth = 1,
    x = 0,
    y = 0,
    z = 0
  ) {
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;
    const x0 = x - w;
    const x1 = x + w;
    const y0 = y - h;
    const y1 = y + h;
    const z0 = z - d;
    const z1 = z + d;

    // prettier-ignore
    const verts = [
      x0, y1, z1,  x0, y0, z1,  x1, y0, z1,  x1, y1, z1,
      x1, y1, z0,  x1, y0, z0,  x0, y0, z0,  x0, y1, z0,
      x0, y1, z0,  x0, y0, z0,  x0, y0, z1,  x0, y1, z1,
      x1, y1, z1,  x1, y0, z1,  x1, y0, z0,  x1, y1, z0,
      x0, y1, z0,  x0, y1, z1,  x1, y1, z1,  x1, y1, z0,
      x0, y0, z1,  x0, y0, z0,  x1, y0, z0,  x1, y0, z1
    ];

    // prettier-ignore
    const indices = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
      12, 13, 14, 12, 14, 15,
      16, 17, 18, 16, 18, 19,
      20, 21, 22, 20, 22, 23
    ];

    const uvs = [];
    for (let i = 0; i < 6; i++) {
      uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
    }

    // prettier-ignore
    const normals = [
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
      -1,0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
      0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
    ];

    const mesh = glUtils.createMeshVAO(gl, name, indices, verts, normals, uvs);
    mesh.noCulling = true;
    return mesh;
  }
}

export default Cube;
