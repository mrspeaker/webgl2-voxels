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
    const { x: px, y: py, z: pz } = point;
    let { x: dirX, y: dirY, z: dirZ } = direction;
    let x = Math.floor(px);
    let y = Math.floor(py);
    let z = Math.floor(pz);

    const stepX = Math.sign(dirX);
    const stepY = Math.sign(dirY);
    const stepZ = Math.sign(dirZ);

    const dtX = 1 / dirX * stepX;
    const dtY = 1 / dirY * stepY;
    const dtZ = 1 / dirZ * stepZ;

    /*
      The point of toX/Y/Z is to find the number of units to the nearest
      edge. If the point was in the middle of a cube, then it would be +0.5
      or -0.5 for each value (depending on direction.)

      The extra case (frac1 vs frac0) is when the initial point is in a
      negative chunk. I'm sure this can be simplified!
    */
    const frac0 = (dir, a) => dir > 0 ? 1 - (a % 1) : a % 1;
    const frac1 = (dir, a) => dir > 0 ? ((a * -1) % 1) : 1 + (a % 1);
    let toX = x >= 0 ? frac0(stepX, px) : frac1(stepX, px);
    let toY = y >= 0 ? frac0(stepY, py) : frac1(stepY, py);
    let toZ = z >= 0 ? frac0(stepZ, pz) : frac1(stepZ, pz);

    toX *= dtX;
    toY *= dtY;
    toZ *= dtZ;

    let found = false;
    let tries = 20;
    let face;
    while (!found && tries-- > 0) {
      if (toX < toY) {
        if (toX < toZ) {
          x += stepX;
          toX += dtX;
          face = stepX > 0 ? Chunk.EAST : Chunk.WEST;
        } else {
          z += stepZ;
          toZ += dtZ;
          face = -stepZ > 0 ? Chunk.NORTH : Chunk.SOUTH;
        }
      } else {
        if (toY < toZ) {
          y += stepY;
          toY += dtY;
          face = -stepY > 0 ? Chunk.UP : Chunk.DOWN;
        } else {
          z += stepZ;
          toZ += dtZ;
          face = -stepZ > 0 ? Chunk.NORTH : Chunk.SOUTH;
        }
      }
      const cell = this.getCell(x, y, z);
      if (cell) {
        return { x, y, z, face };
      }
    }
    return null;
  }
}

export default World;
