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

  update() {}

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

  setCell(x, y, z, v) {
    const { chunks, cx, cy, cz } = this;
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    // get chunk
    const chX = Math.floor(x / cx);
    const chZ = Math.floor(z / cz);
    const chY = Math.floor(y / cy);

    const chIdx = ["0:0:0", "-1:0:0"].indexOf(chX + ":" + chY + ":" + chZ);
    if (chIdx == -1) return;
    chunks[chIdx].chunk.set(x - chX * cx, y - chY * cy, z - chZ * cz, v);
    return chunks[chIdx];
  }

  rechunk(r) {
    const { chunks } = this;

    chunks.forEach(cr => {
      cr.chunk.cells = cr.chunk.cells.map((c, i) => {
        const y = (i / (cr.chunk.x * cr.chunk.z)) | 0;
        if (y < 4) return 1;
        return Math.random() < r ? ((Math.random() * 2) | 0) + 1 : 0;
      });
      cr.rechunk();
    });
  }

  // Traverse world down ray until hit a cell.
  getCellFromRay(point, direction) {
    //https://github.com/kpreid/cubes/blob/c5e61fa22cb7f9ba03cd9f22e5327d738ec93969/world.js#L307
    // TODO: buggy. Inaccurate hits.
    const { x: px, y: py, z: pz } = point;
    let { x: dirX, y: dirY, z: dirZ } = direction;

    let x = Math.floor(px);
    let y = Math.floor(py);
    let z = Math.floor(pz);

    const stepX = Math.sign(dirX);
    const stepY = Math.sign(dirY);
    const stepZ = Math.sign(dirZ);

    const dtX = 1 / (dirX * stepX);
    const dtY = 1 / (dirY * stepY);
    const dtZ = 1 / (dirZ * stepZ);

    const frac = a => (a < 0 ? 1 : 0) + a % 1;
    let toX = dtX * (1 - frac(px));
    let toY = dtY * (1 - frac(py));
    let toZ = dtZ * (1 - frac(pz));

    let found = false;
    let tries = 20;
    while (!found && tries-- > 0) {
      if (toX < toY) {
        if (toX < toZ) {
          x += stepX;
          toX += dtX;
        } else {
          z += stepZ;
          toZ += dtZ;
        }
      } else {
        if (toY < toZ) {
          y += stepY;
          toY += dtY;
        } else {
          z += stepZ;
          toZ += dtZ;
        }
      }
      const cell = this.getCell(x, y, z);
      if (y > 0 && cell) {
        found = true;
        const ch = this.setCell(x, y, z, 0);
        if (ch) {
          ch.rechunk();
        }
      }
    }
  }
}

export default World;
