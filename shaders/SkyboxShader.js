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
  uniform float t;

  out vec4 col;
  void main() {
    vec4 tx = texture(sky, texCoord);
    float rat = 1.0 - ((texCoord.y + 150.0) / 250.0);
    float m = max(0.0, rat - 0.2);
    col = mix(tx, vec4(sin((texCoord.y * texCoord.x) * abs(sin(t / 100.0)) *  300.0), cos((texCoord.z) / 50.0), 0.0, 1.0) * 0.5, m);
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
    return this;
  }

  setTime(t) {
    const { uniforms, gl } = this;
    gl.uniform1f(uniforms.t, t);
    return this;
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
