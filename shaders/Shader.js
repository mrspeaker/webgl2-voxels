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

  setUniforms(...uniforms) {
    if (uniforms[0].name == "proj") {
      this.setPerspective(uniforms[0].value);
    }
    // TODO: how to set uniforms?
    return this;
  }

  setCamera(m) {
    const { gl, uniforms } = this;
    gl.uniformMatrix4fv(uniforms.camera, false, m);
    return this;
  }

  setPerspective(m) {
    const { gl, uniforms } = this;
    gl.uniformMatrix4fv(uniforms.proj, false, m);
    return this;
  }

  setModel(m) {
    const { gl, uniforms } = this;
    gl.uniformMatrix4fv(uniforms.view, false, m);
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

  renderModel(model) {
    const { gl, uniforms } = this;
    const { mesh, transform } = model;
    this.setModel(transform.view);

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
    return this;
  }
}

export default Shader;
