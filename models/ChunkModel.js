import Model from "./Model.js";
import Chunk from "../src/Chunk.js";
import glUtils from "../lib/glUtils.js";

class ChunkModel extends Model {
  constructor(gl, chunk) {
    super();
    this.gl = gl;
    this.chunk = chunk;
    this.rechunk();
  }

  rechunk() {
    const { gl } = this;
    const verts = [];
    const indices = [];
    const uvs = [];
    const faces = [];
    const ao = [];
    ChunkModel.buildMesh(this.chunk, verts, indices, uvs, faces, ao);
    this.mesh = glUtils.createMeshVAO(this.gl, "ch", indices, verts, null, uvs);
    this.setPosition(this.chunk.xo, this.chunk.yo, this.chunk.zo);

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
  }

  static buildMesh(chunk, verts, inds, uvs, faces, ao) {
    const size = chunk.x * chunk.z * chunk.y;
    for (let i = 0; i < size; i++) {
      const idx = chunk.cells[i];
      if (!idx) continue;
      const x = i % chunk.x;
      const z = ((i / chunk.x) | 0) % chunk.z;
      const y = (i / (chunk.x * chunk.z)) | 0;
      // Check each face direction
      let xf;
      let yf;
      const faceUVs = [
        [4, 1, 4, 1, 4, 1, 4, 1, 5, 1, 5, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [4, 0, 3, 2, 4, 0, 3, 2, 4, 0, 4, 0]
      ];

      // AO testing. TODO: only need to get 8 cells around
      // block ONCE and use them (don't re-fetch). This is
      // more efficient and will work accross chunk boundaries.
      const addTopAO = (xo, yo, zo, debug) => {
        const side1 = chunk.get(x, y + yo, z + zo) ? 1 : 0;
        const side2 = chunk.get(x + xo, y + yo, z) ? 1 : 0;
        const corner = chunk.get(x + xo, y + yo, z + zo) ? 1 : 0;
        let vo = 1;
        if (side1 && side2) vo = 0;
        else vo = (3 - (side1 + side2 + corner)) / 3;
        return debug ? vo : vo * 0.5 + 0.5;
      };

      for (let j = 0; j < 6; j++) {
        xf = faceUVs[idx - 1][j * 2];
        yf = faceUVs[idx - 1][j * 2 + 1];
        if (!chunk.get(x, y, z, j)) {
          // Append face
          ChunkModel.appendQuad(chunk, j, x, y, z, verts, inds, uvs);
          faces.push(xf, yf, xf, yf, xf, yf, xf, yf); // uv indexes

          // Experimenting with Ambient Occlusion
          for (let k = 0; k < 4; k++) {
            if (j === Chunk.UP) {
              if (k == 0) {
                // NE vert: get blocks east, up, north
                ao.push(addTopAO(-1, +1, +1));
              } else if (k == 1) {
                // NW vert: get blocks west, up, north
                ao.push(addTopAO(+1, +1, +1));
              } else if (k == 2) {
                // SW vert: get blocks west, up, south
                ao.push(addTopAO(+1, +1, -1));
              } else {
                // SE vert: get blocks east, up, south
                ao.push(addTopAO(-1, +1, -1));
              }
            } else if (j === Chunk.DOWN) {
              if (k == 0) ao.push(addTopAO(-1, -1, -1));
              else if (k == 1) ao.push(addTopAO(1, -1, -1));
              else if (k == 2) ao.push(addTopAO(+1, -1, +1));
              else ao.push(addTopAO(-1, -1, +1)); // NE vert
            } else if (j === Chunk.NORTH) {
              // UH oh... North is the South face!
              ao.push(0.8);
            } else if (j === Chunk.SOUTH) {
              ao.push(0.8);
            }else {
              ao.push(1);
            }
          }
        }
      }
    }
  }

  static appendQuad(chunk, faceDir, x, y, z, verts, inds, uvs) {
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
    }

    Chunk.UV.forEach(uv => uvs.push(uv));

    for (let i = 0; i < Chunk.INDEX.length; i++) {
      inds.push(Chunk.INDEX[i] + indOffset);
    }
  }
}

export default ChunkModel;
