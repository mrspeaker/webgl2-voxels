import ChunkModel from "../models/ChunkModel.js";
import Chunk from "./Chunk.js";

import SimplexNoise from "../vendor/simplex-noise.js";
import spiral2D from "../lib/spiral2D.js";

class World {
  constructor(gl, x = 16, y = 16, z = 16) {
    const spiral = spiral2D(3);
    this.chunks = spiral.map(
      s => new ChunkModel(gl, new Chunk(x, y, z, s[0], 0, s[1]))
    );
    // TODO: fix chunk id-ing.
    this.chIdx = spiral.map(([x, y]) => `${x}:0:${y}`);
    this.cx = x;
    this.cy = y;
    this.cz = z;
  }

  update() {}

  getChunk(x, y, z) {
    const { chIdx, chunks, cx, cy, cz } = this;
    // get chunk
    const chX = Math.floor(x / cx);
    const chZ = Math.floor(z / cz);
    const chY = Math.floor(y / cy);
    const id = chIdx.indexOf(chX + ":" + chY + ":" + chZ);
    if (id == -1) return null;
    return chunks[id];
  }

  getCell(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    const chunk = this.getChunk(x, y, z);
    if (!chunk) return 0;
    const c = chunk.chunk;
    return c.get(x - c.xo, y - c.yo, z - c.zo);
  }

  setCell(x, y, z, v) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);
    const chunk = this.getChunk(x, y, z);
    if (!chunk) return null;
    const c = chunk.chunk;
    c.set(x - c.xo, y - c.yo, z - c.zo, v);
    return chunk;
  }

  gen(initDensity) {
    const { chunks } = this;
    const simplex = new SimplexNoise();
    const density = initDensity || (Math.random() * Math.random() * 40) + 6;
    chunks.forEach(cr => {
      const { chunk } = cr;
      const AIR = 0;
      const TREE = 1;
      const GRASS = 2;
      const STONE = 3;
      //const BOOKS = 4;
      chunk.cells = chunk.cells.map((c, i) => {
        let x = i % chunk.x + chunk.xo;
        let z = ((i / chunk.x) | 0) % chunk.z + chunk.zo;
        let y = ((i / (chunk.x * chunk.z)) | 0) + chunk.yo;

        if (y < 1) return GRASS; // Ground
        let v = simplex.noise3D(x / density, y / density, z / density) * 8;
        //const bowl = (Math.sin(x / 4) * Math.cos(z / 4)) * 16;
        //if (y <= bowl) v = 0;
        const solid = Math.max(0, Math.min(1, Math.floor(v)));
        const isStone = (v / 3) | (0 == 1);
        const isWood = (v | 0) % 3 == 2;
        return !solid ? AIR : isStone ? STONE : isWood ? TREE : GRASS;
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
      or -0.5 for each value (depending on direction, and if chunk is -ve)
      * chunk > 0 && dir > 0 && pos = 0.7 => 0.3;
      * chunk > 0 && dir < 0 && pos = 0.7 => 0.7;
    */
    const frac = (dir, a) => (dir > 0 ? 1 - a % 1 : a % 1);
    let toX = x >= 0 ? frac(stepX, px) : frac(-stepX, -px);
    let toY = y >= 0 ? frac(stepY, py) : frac(-stepY, -py);
    let toZ = z >= 0 ? frac(stepZ, pz) : frac(-stepZ, -pz);

    toX *= dtX;
    toY *= dtY;
    toZ *= dtZ;

    let found = false;
    let maxDist = 20;
    let face;

    while (!found && maxDist-- > 0) {
      if (toX < toY) {
        if (toX < toZ) {
          x += stepX;
          toX += dtX;
          face = stepX > 0 ? Chunk.EAST : Chunk.WEST;
        } else {
          z += stepZ;
          toZ += dtZ;
          face = stepZ > 0 ? Chunk.NORTH : Chunk.SOUTH;
        }
      } else {
        if (toY < toZ) {
          y += stepY;
          toY += dtY;
          face = -stepY > 0 ? Chunk.UP : Chunk.DOWN;
        } else {
          z += stepZ;
          toZ += dtZ;
          face = stepZ > 0 ? Chunk.NORTH : Chunk.SOUTH;
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
