import Shader from "./Shader.js";

const vss = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;

  layout(location=0) in vec3 pos;
  layout(location=2) in vec2 uv;
  layout(location=3) in vec3 tx;

  out vec2 texCoord;

  void main() {
    texCoord = uv;
    gl_Position = proj * camera * view * vec4(pos + tx, 1.0);
  }
`;

const fss = `#version 300 es
  precision highp float;
  uniform sampler2D tex0;
  in vec2 texCoord;
  out vec4 col;
  void main() {
      float dist = gl_FragCoord.z / gl_FragCoord.w;
      float fog = 1.0 - (clamp((15.0 - dist) / (15.0 - 0.2), 0.0, 1.0));
      col = mix(texture(tex0, texCoord), vec4(0.0, 0.0, 0.0, 1.0), fog);
  }
`;

class FogShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vss, fss);
    this.setPerspective(pMatrix);

    gl.useProgram(null);
  }

  renderModel(model) {
    const { gl, uniforms } = this;
    const { mesh, transform } = model;
    this.setModel(transform.view);

    gl.bindVertexArray(mesh.vao);
    if (mesh.noCulling) gl.disable(gl.CULL_FACE);
    if (mesh.doBlending) gl.enable(gl.BLEND);
    if (mesh.indexCount) {
      if (mesh.instances) {
        gl.drawElementsInstanced(
          mesh.drawMode,
          mesh.indexCount,
          gl.UNSIGNED_SHORT,
          0,
          mesh.instances
        );
      } else {
        gl.drawElements(mesh.drawMode, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
      }
    } else {
      gl.drawArrays(mesh.drawMode, 0, mesh.vertCount);
    }
    if (mesh.noCulling) gl.enable(gl.CULL_FACE);
    if (mesh.doBlending) gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
    return this;
  }
}

export default FogShader;
