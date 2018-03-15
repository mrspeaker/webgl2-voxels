class Chunk {
  constructor(x = 2, y = 2, z = 2) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.cells = [...Array(x * z * y)].fill(1);
  }
  getIdx(x, y, z) {
    return x + z * this.x + y * this.x * this.z;
  }
  set(x, y, z, v) {
    this.cells[this.getIdx(x, y, z)] = v;
  }
  get(x, y, z, dir = -1) {
    if (dir != -1) {
      const n = Chunk.FACES[dir].n;
      x += n[0];
      y += n[1];
      z += n[2];
    }
    if (
      x < 0 ||
      x > this.x - 1 ||
      y < 0 ||
      y > this.y - 1 ||
      z < 0 ||
      z > this.z - 1
    ) {
      return null;
    }
    const idx = x + z * this.x + y * this.x * this.z;
    return this.cells[idx];
  }
}

Chunk.NORTH = 0;
Chunk.EAST = 1;
Chunk.SOUTH = 2;
Chunk.WEST = 3;
Chunk.UP = 4;
Chunk.DOWN = 5;

Chunk.UV = [0, 1, 1, 1, 1, 0, 0, 0];
Chunk.INDEX = [0, 1, 2, 2, 3, 0];
Chunk.FACES = [
  {
    n: [0, 0, -1],
    nOffset: false,
    v: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0]
  },
  {
    n: [-1, 0, 0],
    nOffset: false,
    v: [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0]
  },
  {
    n: [0, 0, 1],
    nOffset: true,
    v: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]
  },
  {
    n: [1, 0, 0],
    nOffset: true,
    v: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1]
  },
  {
    n: [0, 1, 0],
    nOffset: true,
    v: [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0]
  },
  {
    n: [0, -1, 0],
    nOffset: false,
    v: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1]
  }
];

export default Chunk;
