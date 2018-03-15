const textures = {};

const glUtils = {
  ATTR_POSITION_LOC: 0,
  ATTR_NORMAL_LOC: 1,
  ATTR_UV_LOC: 2,

  textures,

  createProgram(gl, vss, fss) {
    const p = gl.createProgram();
    this.program = p;

    const vs = this.compileShader(gl, vss, gl.VERTEX_SHADER);
    const fs = this.compileShader(gl, fss, gl.FRAGMENT_SHADER);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
    }

    return p;
  },

  compileShader(gl, src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  },

  getCurrentAttribs(gl, program) {
    return [...Array(gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES))]
      .map((_, i) => {
        const { size, type, name } = gl.getActiveAttrib(program, i);
        const loc = gl.getAttribLocation(program, name);
        return { size, type, name: name.split("[")[0], loc };
      })
      .reduce((ac, el) => {
        ac[el.name] = el;
        return ac;
      }, {});
  },

  getCurrentUniforms(gl, program) {
    return [...Array(gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS))]
      .map((_, i) => {
        const { size, type, name } = gl.getActiveUniform(program, i);
        const loc = gl.getUniformLocation(program, name);
        return { size, type, name: name.split("[")[0], loc };
      })
      .reduce((ac, el) => {
        ac[el.name] = el.loc;
        return ac;
      }, {});
  },

  createMeshVAO(gl, name, indices, verts, normals, uvs) {
    const mesh = {
      drawMode: gl.TRIANGLES,
      vao: gl.createVertexArray()
    };

    gl.bindVertexArray(mesh.vao);

    if (indices) {
      mesh.indices = gl.createBuffer();
      mesh.indexCount = indices.length;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      //  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    if (verts) {
      mesh.verts = gl.createBuffer();
      mesh.vertComponentSize = 3;
      mesh.vertCount = verts.length / mesh.vertComponentSize;
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.verts);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(glUtils.ATTR_POSITION_LOC);
      gl.vertexAttribPointer(
        glUtils.ATTR_POSITION_LOC,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );
    }

    if (normals) {
      mesh.normals = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normals);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(glUtils.ATTR_NORMAL_LOC);
      gl.vertexAttribPointer(glUtils.ATTR_NORMAL_LOC, 3, gl.FLOAT, false, 0, 0);
    }

    if (uvs) {
      mesh.uvs = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvs);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(glUtils.ATTR_UV_LOC);
      gl.vertexAttribPointer(glUtils.ATTR_UV_LOC, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    if (indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    return mesh;
  },

  loadTexture(gl, name, img, doYFlip = false) {
    const tex = gl.createTexture();
    if (doYFlip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_NEAREST
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (doYFlip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    textures[name] = tex;
    return tex;
  },

  loadCubeMap(gl, name, imgs) {
    if (imgs.length != 6) {
      throw Error("cube map needs 6 imgs");
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    imgs.map((img, i) => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    textures[name] = tex;
    return tex;
  },

  setSize(gl, w, h) {
    gl.canvas.style.width = w + "px";
    gl.canvas.style.height = h + "px";
    gl.canvas.width = w;
    gl.canvas.height = h;
    gl.viewport(0, 0, w, h);
  },

  fitScreen(gl, wp, hp) {
    return this.setSize(
      gl,
      window.innerWidth * (wp || 1),
      window.innerHeight * (hp || 1)
    );
  }
};

export default glUtils;
