import glUtils from "../lib/glUtils.js";

class Shader {
  constructor(gl, vs, fs) {
    this.gl = gl;
    const p = (this.program = glUtils.createProgram(gl, vs, fs));
    this.attributes = glUtils.getCurrentAttribs(gl, p);
    this.uniforms = glUtils.getCurrentUniforms(gl, p);
    this.textures = [];
    this.activate();
  }

  activate() {
    this.gl.useProgram(this.program);
    return this;
  }

  deactivate() {
    this.gl.useProgram(null);
    return this;
  }

  dispose() {
    const { gl, program } = this;
    if (gl.getParameter(gl.CURRENT_PROGRAM) == program) {
      gl.deleteProgram(program);
    }
    return this;
  }

  setTexture(tex) {
    this.textures.push(tex);
    return this;
  }

  setUniforms(...unis) {
    const { gl, uniforms } = this;

    // Uniforms supplied as args: name/value
    unis.reduce((name, value, i) => {
      if (i % 2 == 1) {
        const u = uniforms[name];
        if (!u) {
        //  console.warn("No uniform called", name);
          return;
        }
        // TODO: more types
        switch (u.type) {
          case gl.FLOAT_MAT4:
            gl.uniformMatrix4fv(u.loc, false, value);
            break;
          case gl.FLOAT:
            gl.uniform1f(u.loc, value);
            break;
          case gl.SAMPLER_CUBE:
          case gl.SAMPLER_2D:
            gl.uniform1i(u.loc, value);
            break;
          case gl.FLOAT_VEC3:
            gl.uniform3fv(u.loc, value);
            break;
          case gl.FLOAT_VEC4:
            gl.uniform4fv(u.loc, value);
            break;
          default:
            console.warn("don't know gl type", u.type, "for uniform", name);
        }
      }
      return value;
    });
    return this;
  }

  preRender(...uniforms) {
    const { gl, textures } = this;
    if (uniforms.length) {
      this.setUniforms(...uniforms);
    }
    textures.forEach((t, i) => {
      gl.activeTexture(gl["TEXTURE" + i]);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(uniforms["tex" + i], i);
    });
    return this;
  }

  render(model) {
    const { gl } = this;

    model = !model.length ? [model] : model;
    model.forEach(m => {
      const { mesh } = m;
      m.preRender && m.preRender();

      this.setUniforms("view", m.view);

      gl.bindVertexArray(mesh.vao);
      if (mesh.noCulling) gl.disable(gl.CULL_FACE);
      if (mesh.doBlending) gl.enable(gl.BLEND);
      if (mesh.indexCount) {
        gl.drawElements(mesh.drawMode, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawArrays(mesh.drawMode, 0, mesh.vertCount);
      }
      if (mesh.noCulling) gl.enable(gl.CULL_FACE);
      if (mesh.doBlending) gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    });
    return this;
  }
}

export default Shader;
