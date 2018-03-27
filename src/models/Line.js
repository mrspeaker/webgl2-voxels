import Model from "./Model.js";

class Line {
  static create(gl, includeAxes) {
    return new Model(Line.createMesh(gl, includeAxes));
  }
  static createMesh(gl) {
    const mesh = {
      drawMode: gl.LINES,
      vao: gl.createVertexArray(),
      bufVerts: gl.createBuffer()
    };

    const verts = [];
    mesh.verts = verts;
    verts.push(0, 0, -100, 1);
    verts.push(0, 0, 100, 1);

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

    const addLine = (v1, v2) => {
      verts.push(v1.x, v1.y, v1.z, 1);
      verts.push(v2.x, v2.y, v2.z, 1);
      mesh.vertCount = verts.length / 4;
      remesh();
    };

    const remesh = (v1, v2) => {
      const v = verts;
      if (v1) {
        v[0] = v1.x;
        v[1] = v1.y;
        v[2] = v1.z;
        v[3] = 3;
        v[4] = v2.x;
        v[5] = v2.y;
        v[6] = v2.z;
        v[7] = 3;
      }
      gl.bindVertexArray(mesh.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVerts);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 4, 0);

      gl.enableVertexAttribArray(4);
      gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 4 * 4, 3 * 4);

      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    mesh.remesh = remesh;
    mesh.addLine = addLine;

    return mesh;
  }
}

export default Line;
