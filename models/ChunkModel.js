import Model from "./Model.js";
import Chunk from "../src/Chunk.js";
import glUtils from "../lib/glUtils.js";

class ChunkModel extends Model {
  constructor(gl, chunk) {
    super();
    this.gl = gl;
    this.chunk = chunk;
  }

  rechunk() {
    const { gl, chunk } = this;
    const verts = [];
    const indices = [];
    const uvs = [];
    const faces = [];
    const ao = [];
    const normals = [];
    ChunkModel.buildMesh(chunk, verts, indices, uvs, normals, faces, ao);
    this.mesh = glUtils.createMeshVAO(gl, "ch", indices, verts, normals, uvs);
    this.position.set(chunk.xo, chunk.yo, chunk.zo);

    // Push uv indexes
    gl.bindVertexArray(this.mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ao), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    chunk.isDirty = false;
  }

  static buildMesh(chunk, verts, inds, uvs, normals, faces, ao) {
    const size = chunk.x * chunk.z * chunk.y;
    for (let i = 0; i < size; i++) {
      const idx = chunk.cells[i];
      if (!idx) continue;
      const x = i % chunk.x;
      const z = ((i / chunk.x) | 0) % chunk.z;
      const y = (i / (chunk.x * chunk.z)) | 0;

      const blockUVs = [
        [4, 1, 4, 1, 4, 1, 4, 1, 5, 1, 5, 1],
        [3, 0, 3, 0, 3, 0, 3, 0, 0, 0, 2, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [3, 2, 4, 0, 3, 2, 4, 0, 4, 0, 4, 0]
      ];

      // AO testing. TODO: only need to get 8 cells around
      // block ONCE and use them (don't re-fetch). This is
      // more efficient and will work accross chunk boundaries.
      // (also, move this to appendQuad)
      const addAO = (s1x, s1y, s1z, s2x, s2y, s2z, cx, cy, cz, debug) => {
        const side1 = chunk.get(x + s1x, y + s1y, z + s1z) ? 1 : 0;
        const side2 = chunk.get(x + s2x, y + s2y, z + s2z) ? 1 : 0;
        const corner = chunk.get(x + cx, y + cy, z + cz) ? 1 : 0;
        let vo = 1;
        if (side1 && side2) vo = 0;
        else vo = (3 - (side1 + side2 + corner)) / 3;
        return debug ? vo : vo * 0.5 + 0.5;
      };

      // Check each face direction
      let xf;
      let yf;
      for (let j = 0; j < Chunk.FACES.length; j++) {
        xf = blockUVs[idx - 1][j * 2];
        yf = blockUVs[idx - 1][j * 2 + 1];
        if (!chunk.get(x, y, z, j)) {
          // Append face
          ChunkModel.appendQuad(chunk, j, x, y, z, verts, inds, uvs, normals);
          faces.push(xf, yf, xf, yf, xf, yf, xf, yf); // uv indexes

          // Experimenting with Ambient Occlusion
          // Get the "side" and "corner" blocks for each vertex.
          // TODO: Should be able to do this with an algo (with normals)
          for (let k = 0; k < 4; k++) {
            if (j === Chunk.UP) {
              ao.push(addAO(...[
                [-1, 1, 0, 0, 1, 1, -1, 1, 1], // SW
                [1, 1, 0, 0, 1, 1, 1, 1, 1], // SE
                [1, 1, 0, 0, 1, -1, 1, 1, -1], // NE
                [-1, 1, 0, 0, 1, -1, -1, 1, -1] // NW
              ][k]));
            } else if (j === Chunk.DOWN) {
              ao.push(addAO(...[
                [-1, -1, 0, 0, -1, -1, -1, -1, -1],
                [1, -1, 0, 0, -1, -1, 1, -1, -1],
                [1, -1, 0, 0, -1, 1, 1, -1, 1],
                [-1, -1, 0, 0, -1, 1, -1, -1, 1]
              ][k]));
            } else if (j === Chunk.NORTH) {
              ao.push(addAO(...[
                [0, -1, -1, 1, 0, -1, 1, -1, -1],
                [0, -1, -1, -1, 0, -1, -1, -1, -1],
                [0, 1, -1, -1, 0, -1, -1, 1, -1],
                [0, 1, -1, 1, 0, -1, 1, 1, -1]
              ][k]));
            } else if (j === Chunk.SOUTH) {
              ao.push(addAO(...[
                [0, -1, 1, -1, 0, 1, -1, -1, 1],
                [0, -1, 1, 1, 0, 1, 1, -1, 1],
                [0, 1, 1, 1, 0, 1, 1, 1, 1],
                [0, 1, 1, -1, 0, 1, -1, 1, 1]
              ][k]));
            } else if (j === Chunk.EAST){
              ao.push(addAO(...[
                [-1, -1, 0, -1, 0, -1, -1, -1, -1],
                [-1, -1, 0, -1, 0, 1, -1, -1, 1],
                [-1, 1, 0, -1, 0, 1, -1, 1, 1],
                [-1, 1, 0, -1, 0, -1, -1, 1, -1]
              ][k]));
            } else if (j === Chunk.WEST){
              ao.push(addAO(...[
                [1, -1, 0, 1, 0, 1, 1, -1, 1],
                [1, -1, 0, 1, 0, -1, 1, -1, -1],
                [1, 1, 0, 1, 0, -1, 1, 1, -1],
                [1, 1, 0, 1, 0, 1, 1, 1, 1]
              ][k]));
            }
          }
        }
      }
    }
  }

  static appendQuad(chunk, faceDir, x, y, z, verts, inds, uvs, normals) {
    const face = Chunk.FACES[faceDir];
    const v = face.v;
    const indOffset = verts.length / 3;

    if (face.nOffset) {
      // Move origin of quad by normal pos
      x += face.n[0];
      y += face.n[1];
      z += face.n[2];
    }

    for (let i = 0; i < 4; i++) {
      verts.push(v[i * 3 + 0] + x, v[i * 3 + 1] + y, v[i * 3 + 2] + z);
      normals.push(...face.n);
    }

    Chunk.UV.forEach(uv => uvs.push(uv));

    for (let i = 0; i < Chunk.INDEX.length; i++) {
      inds.push(Chunk.INDEX[i] + indOffset);
    }
  }
}

export default ChunkModel;
