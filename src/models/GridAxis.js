import Model from "./Model.js";

class GridAxis {
  static create(gl, includeAxes) {
    return new Model(GridAxis.createMesh(gl, includeAxes));
  }
  static createMesh(gl, includeAxes = true) {
    const mesh = {
      drawMode: gl.LINES,
      vao: gl.createVertexArray(),
      bufVerts: gl.createBuffer()
    };

    const verts = [];
    const size = 32;
    const div = 32;
    const step = size / div;
    const half = size / 2;

    for (let i = 0; i <= div; i++) {
      if (includeAxes && i == div / 2) continue;
      const p = -half + i * step;
      verts.push(p, 0, half, 0);
      verts.push(p, 0, -half, 0);
      verts.push(-half, 0, p, 0);
      verts.push(half, 0, p, 0);
    }

    if (includeAxes) {
      verts.push(-size * 0.55, 0, 0, 1);
      verts.push(size * 0.55, 0, 0, 1);

      verts.push(0, -size * 0.55, 0, 2);
      verts.push(0, size * 0.55, 0, 2);

      verts.push(0, 0, -size * 0.55, 3);
      verts.push(0, 0, size * 0.55, 3);
    }

    mesh.vertCount = verts.length / 4;

    gl.bindVertexArray(mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVerts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 4, 0);

    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 4 * 4, 3 * 4);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return mesh;
  }
}

export default GridAxis;
