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
    ChunkModel.buildMesh(this.chunk, verts, indices, uvs, faces);
    this.mesh = glUtils.createMeshVAO(this.gl, "ch", indices, verts, null, uvs);
    this.setPosition(this.chunk.xo, this.chunk.yo, this.chunk.zo);
    // Push uv indexes
    gl.bindVertexArray(this.mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  static buildMesh(chunk, verts, inds, uvs, faces) {
    const size = chunk.x * chunk.z * chunk.y;
    for (let i = 0; i < size; i++) {
      const idx = chunk.cells[i];
      if (!idx) continue;
      const x = i % chunk.x;
      const z = ((i / chunk.x) | 0) % chunk.z;
      const y = (i / (chunk.x * chunk.z)) | 0;
      // Check each face direction
      let xf; // = 4; //Math.random() * 2 * 2 | 0;
      let yf; // = 1; //Math.random() * 2 * 2 | 0;
      const oh = [
        [4, 1, 4, 1, 4, 1, 4, 1, 5, 1, 5, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [4, 0, 3, 2, 4, 0, 3, 2, 4, 0, 4, 0]
      ];
      for (let j = 0; j < 6; j++) {
        xf = oh[idx - 1][j * 2];
        yf = oh[idx - 1][j * 2 + 1];
        if (!chunk.get(x, y, z, j)) {
          // Append face
          ChunkModel.appendQuad(chunk, j, x, y, z, verts, inds, uvs);
          faces.push(xf, yf, xf, yf, xf, yf, xf, yf); // uv indexes
        }
      }
    }
  }

  static appendQuad(chunk, faceDir, x, y, z, verts, inds, uvs) {
    const face = Chunk.FACES[faceDir];
    const v = face.v;
    const indOffset = verts.length / 3;

    if (face.nOffset) {
      // MOve origin of quad by normal pos
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
