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

    // TODO: simplify!
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
    let o = "";
    while (!found && tries-- > 0) {
      if (toX < toY) {
        if (toX < toZ) {
          o += "x1-" + dtX.toFixed(2) + ",";
          x += stepX;
          toX += dtX;
        } else {
          o += "z1-" + dtZ.toFixed(2) + ",";
          z += stepZ;
          toZ += dtZ;
        }
      } else {
        if (toY < toZ) {
          o += "y2-" + dtY.toFixed(2) + ",";
          y += stepY;
          toY += dtY;
        } else {
          o += "z2-" + dtZ.toFixed(2) + ",";
          z += stepZ;
          toZ += dtZ;
        }
      }
      const cell = this.getCell(x, y, z);
      if (cell) {
        found = true;
        const ch = this.setCell(x, y, z, 0);
        if (ch) {
          ch.rechunk();
        }
        return { x, y, z };
      }
    }
  }

  raycast(origin, direction) {
    // Cube containing origin point.
    var x = Math.floor(origin.x);
    var y = Math.floor(origin.y);
    var z = Math.floor(origin.z);
    console.log("st", x, z);
    // Break out direction vector.
    var dx = direction.x;
    var dy = direction.y;
    var dz = direction.z;

    console.log(dx.toFixed(2), dz.toFixed(2));

    const mod = (value, modulus) => {
      return (value % modulus + modulus) % modulus;
    };
    const intbound = (s, ds) => {
      // Find the smallest positive t such that s+t*ds is an integer.
      if (ds < 0) {
        return intbound(-s, -ds);
      } else {
        s = mod(s, 1);
        // problem is now s+t*ds = 1
        return (1 - s) / ds;
      }
    };
    // Direction to increment x,y,z when stepping.
    var stepX = Math.sign(dx);
    var stepY = Math.sign(dy);
    var stepZ = Math.sign(dz);
    // See description above. The initial values depend on the fractional
    // part of the origin.
    var tMaxX = intbound(x, dx);
    var tMaxY = intbound(y, dy);
    var tMaxZ = intbound(z, dz);
    // The change in t when taking a step (always positive).
    var tDeltaX = stepX / dx;
    var tDeltaY = stepY / dy;
    var tDeltaZ = stepZ / dz;
    // Buffer for reporting faces to the callback.
    //var face = vec3.create();
    console.log(tMaxX.toFixed(2), tMaxZ.toFixed(2), "Delt", tDeltaX.toFixed(2), tDeltaZ.toFixed(2));

    // Avoids an infinite loop.
    if (dx === 0 && dy === 0 && dz === 0)
      throw new RangeError("Raycast in zero direction!");

    // Rescale from units of 1 cube-edge to units of 'direction' so we can
    // compare with 't'.
    //radius /= Math.sqrt(dx * dx + dy * dy + dz * dz);
    let found = false;
    let tries = 20;
    let o = "";
    while (!found && tries-- >= 0) {
      // Invoke the callback, unless we are not *yet* within the bounds of the
      // world.
      //if (!(x < 0 || y < 0 || z < 0 || x >= wx || y >= wy || z >= wz))
      //  if (callback(x, y, z, blocks[x * wy * wz + y * wz + z], face)) break;

      // tMaxX stores the t-value at which we cross a cube boundary along the
      // X axis, and similarly for Y and Z. Therefore, choosing the least tMax
      // chooses the closest cube boundary. Only the first case of the four
      // has been commented in detail.
      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          // Update which cube we are now in.
          x += stepX;
          // Adjust tMaxX to the next X-oriented boundary crossing.
          tMaxX += tDeltaX;
          // Record the normal vector of the cube face we entered.
          // face[0] = -stepX;
          // face[1] = 0;
          // face[2] = 0;
          o += "x1-" +  Math.round(tDeltaX)  + "," + Math.round(tDeltaZ) + "|||";
        } else {
          z += stepZ;
          tMaxZ += tDeltaZ;
          // face[0] = 0;
          // face[1] = 0;
          // face[2] = -stepZ;
          o += "z1-" +  Math.round(tDeltaX)  + "," + Math.round(tDeltaZ) + "|||";
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          tMaxY += tDeltaY;
          // face[0] = 0;
          // face[1] = -stepY;
          // face[2] = 0;
          o += "y2-" +  Math.round(tDeltaX)  + "," + Math.round(tDeltaZ) + "|||";
        } else {
          // Identical to the second case, repeated for simplicity in
          // the conditionals.
          z += stepZ;
          tMaxZ += tDeltaZ;
          // face[0] = 0;
          // face[1] = 0;
          // face[2] = -stepZ;
          o += "z1-" +  Math.round(tDeltaX)  + "," + Math.round(tDeltaZ) + "|||";
        }
      }
      const cell = this.getCell(x, y, z);
      if (cell) {
        found = true;
        //const ch = this.setCell(x, y, z, 0);
        //if (ch) {
        //  ch.rechunk();
        //}
        console.log(o);
        return { x, y, z };
      }
    }
    console.log(o);
    return null;//return(x, y, z);
  }
}

export default World;
