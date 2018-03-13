import Shader from "./Shader.js";

const vss = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;

  layout(location=0) in vec3 pos;
  layout(location=2) in vec2 uv;

  out vec3 texCoord;
  void main() {
    texCoord = pos;
    gl_PointSize = 10.0f;
    gl_Position = proj * camera * view * vec4(pos, 1.0);
  }
`;

const fss = `#version 300 es
  precision highp float;
  in vec3 texCoord;
  uniform samplerCube sky;

  out vec4 col;
  void main() {
    col = texture(sky, texCoord) * vec4(0.3, 0.3, 0.3, 1.0);
  }
`;

class DefaultShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vss, fss);
    this.setPerspective(pMatrix);
    gl.useProgram(null);
  }

  setCube(skyTex) {
    this.skyTex = skyTex;
  }

  preRender() {
    const { gl, skyTex, uniforms } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyTex);
    gl.uniform1i(uniforms.sky, 0);
    return this;
  }
}

export default DefaultShader;
