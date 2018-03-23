import Shader from "./Shader.js";

const vss = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;

  layout(location=0) in vec3 pos;
  layout(location=2) in vec2 uv;
  layout(location=3) in vec2 sprite;
  layout(location=4) in float ao;

  out vec2 texCoord;
  out float occ;

  const float size = 1.0 / 16.0;

  void main() {
    occ = ao;
    float u = sprite.x * size + uv.x * size;
    float v = sprite.y * size + uv.y * size;
    texCoord = vec2(u, v);
    gl_Position = proj * camera * view * vec4(pos, 1.0);
  }
`;

const fss = `#version 300 es
  precision highp float;
  uniform sampler2D tex0;
  in vec2 texCoord;
  in float occ;
  out vec4 col;
  void main() {
      float near = 40.0;
      float far = 80.0;
      float dist = gl_FragCoord.z / gl_FragCoord.w;
      float fog = 1.0 - (clamp((far - dist) / (far - near), 0.0, 1.0));
      vec4 fogmix = mix(texture(tex0, texCoord), vec4(135.0/255.0, 165.0/255.0, 1.0, 1.0), fog);
      col= vec4(fogmix.rgb * occ, 1.0);
  }
`;

class VoxelShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vss, fss);
    this.setPerspective(pMatrix);
    gl.useProgram(null);
  }

  renderModel(model) {
    const { gl } = this;
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

export default VoxelShader;
