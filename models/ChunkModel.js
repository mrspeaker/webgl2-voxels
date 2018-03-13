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

  rechunk () {
    const verts = [];
    const indices = [];
    const uvs = [];
    ChunkModel.buildMesh(this.chunk, verts, indices, uvs);
    this.mesh = glUtils.createMeshVAO(this.gl, "ch", indices, verts, null, uvs);
  }

  static buildMesh(chunk, verts, inds, uvs) {
    const size = chunk.x * chunk.z * chunk.y;
    for (let i = 0; i < size; i++) {
      if (!chunk.cells[i]) continue;
      const x = i % chunk.x;
      const z = ((i / chunk.x) | 0) % chunk.z;
      const y = (i / (chunk.x * chunk.z)) | 0;
      // Check each face direction
      for (let j = 0; j < 6; j++) {
        const c = chunk.get(x, y, z, j);
        if (c != 1) {
          // Append face
          ChunkModel.appendQuad(chunk, j, x, y, z, verts, inds, uvs);
        }
      }
    }
  }

  static appendQuad(chunk, faceDir, x, y, z, verts, inds, uvs) {
    const face = Chunk.FACES[faceDir];
    const v = face.v;
    const indOffset = verts.length / 3;
    if (face.nOffset) {
      x += face.n[0];
      y += face.n[1];
      z += face.n[2];
    }

    for (let i = 0; i < 4; i++) {
      verts.push(
        v[i * 3 + 0] + x,
        v[i * 3 + 1] + y,
        v[i * 3 + 2] + z
      );
    }

    Chunk.UV.forEach(uv => uvs.push(uv));

    for (let i = 0; i < Chunk.INDEX.length; i++) {
      inds.push(Chunk.INDEX[i] + indOffset);
    }
  }
}

export default ChunkModel;
