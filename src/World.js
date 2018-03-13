import ChunkModel from "../models/ChunkModel.js";
import Chunk from "./Chunk.js";

class World {
  constructor(gl, x = 16, y = 16, z = 16) {
    this.chunks = [
      new ChunkModel(gl, new Chunk(x, y, z)),
      new ChunkModel(gl, new Chunk(x, y, z)).setPosition(-16, 0, 0)
    ];

    this.cx = x;
    this.cy = y;
    this.cz = z;
  }

  update(dt) {}

  getCell(x, y, z) {
    const { chunks, cx, cy, cz } = this;
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    // get chunk
    const chX = Math.floor(x / cx);
    const chZ = Math.floor(z / cz);
    const chY = Math.floor(y / cy);

    const chIdx = ["0:0:0", "-1:0:0"].indexOf(chX + ":" + chY + ":" + chZ);
    if (chIdx == -1) return 0;
    return chunks[chIdx].chunk.get(x - chX * cx, y - chY * cy, z - chZ * cz);
  }

  rechunk(r) {
    const { chunks } = this;

    chunks.forEach(cr => {
      cr.chunk.cells = cr.chunk.cells.map((c, i) => {
        const y = (i / (cr.chunk.x * cr.chunk.z)) | 0;
        return Math.random() < r || y === 0 ? 1 : 0;
      });
      cr.rechunk();
    });
  }
}

export default World;
