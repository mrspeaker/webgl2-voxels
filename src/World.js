import ChunkModel from "./models/ChunkModel.js";
import Cube from "./models/Cube.js";

import Chunk from "./Chunk.js";

import SimplexNoise from "../vendor/simplex-noise.js";
import spiral2D from "../lib/spiral2D.js";
import Vec3 from "../lib/Vec3.js";

class World {
  constructor(gl, x = 16, y = 16, z = 16) {
    const spiral = spiral2D(3);
    this.chunks = spiral.map(
      s => new ChunkModel(gl, new Chunk(x, y, z, s[0], 0, s[1]))
    );
    // TODO: fix chunk id-ing.
    this.chIdx = spiral.map(([x, y]) => `${x}:0:${y}`);

    // Extra chunk for portal
    this.chunks.push(new ChunkModel(gl, new Chunk(x, y, z, 0, 1, 0)));
    this.chIdx.push("0:1:0");

    this.cx = x;
    this.cy = y;
    this.cz = z;

    this.portal = {
      renderable: Cube.create(gl, "portal", 3.99, 4.99, 1),
      timeInPortal: 0,
      leftPortal: false
    };

    this.ad = {
      visible: false,
      renderable: Cube.create(gl)
    };
    this.ad.renderable.scale.set(0.75, 0.75, 0.75);
  }

  update() {
    this.chunks.forEach(c => {
      if (c.chunk.isDirty) {
        c.rechunk();
      }
    });
  }

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
    const density = initDensity || Math.random() * Math.random() * 40 + 6;
    // Slice out portal chunk!
    chunks.slice(0, -1).forEach(cr => {
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

    this.setPortal();
    this.setAd();
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

  setPortal() {
    const { portal } = this;
    const { renderable } = portal;
    const x = 0;
    const y = 17;
    const z = 0;

    portal.timeInPortal = 0;
    portal.leftPortal = false;
    renderable.position.set(x + 3, y + 3.5, z + 0.5);

    for (let i = 1; i < 6; i++) {
      this.setCell(x + i, y, z, 4);
      this.setCell(x + i, y + 6, z, 4);
    }
    for (let i = 0; i < 7; i++) {
      this.setCell(x, y + i, z, 3);
      this.setCell(x + 5, y + i, z, 3);
    }
  }

  didTriggerPortal(pos, dt) {
    const { portal } = this;
    const { leftPortal, timeInPortal } = portal;
    const distToPortal = Vec3.from(pos)
      .scale(-1)
      .addv(portal.renderable.position)
      .lengthSq();

    if (distToPortal <= 6) {
      portal.timeInPortal = leftPortal ? timeInPortal + dt : 0;
    } else if (!leftPortal) {
      portal.leftPortal = true;
      portal.timeInPortal = 0;
    }

    if (portal.timeInPortal > 2) {
      portal.timeInPortal = 0;
      portal.leftPortal = false;
      return true;
    }

    return false;
  }

  didTriggerAd(pos) {
    const { ad } = this;
    const distToAd = Vec3.from(pos)
      .scale(-1)
      .addv(ad.renderable.position)
      .lengthSq();
    return distToAd < 10;
  }

  setAd() {
    const { ad } = this;
    let found = false;
    let max = 20;
    let x;
    let z;
    while (!found && max-- > 0) {
      x = Math.floor(Math.random() * 60 - 30);
      z = Math.floor(Math.random() * 60 - 30);
      let hit = false;
      for (let yo = 1; yo < 4; yo++) {
        for (let zo = -1; zo < 2; zo++) {
          for (let xo = -1; xo < 2; xo++) {
            if (hit) break;
            const c = this.getCell(x + xo, yo, z + zo);
            if (c) {
              hit = true;
              break;
            }
          }
        }
      }
      if (!hit) {
        found = true;
      }
    }
    ad.renderable.position.set(x, 2.5, z);
  }
}

export default World;
