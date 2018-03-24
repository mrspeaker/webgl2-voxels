import Shader from "./Shader.js";

const vs = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;
  uniform vec3 colours[4];

  layout(location=0) in vec3 pos;
  out vec3 vpos;
  void main() {
    vpos = pos;
    gl_Position = proj * camera * view * vec4(pos, 1.0);
  }
`;

const fs = `#version 300 es
  precision highp float;
  uniform float t;
  in vec3 vpos;
  out vec4 col;
  void main() {
    float r = cos(t + vpos.x * vpos.y * 2.9) / 1.5;
    float g = sin(t + vpos.y * vpos.x * 3.0) / 5.0;
    float b = 0.0;
    col = vec4(r, g, b, 0.7);
  }
`;

class PortalShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vs, fs);
    this.setPerspective(pMatrix);
  }

  activate() {
    const { gl } = this;
    super.activate();

    gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST);
    return this;
  }

  deactivate() {
    const { gl } = this;
    gl.disable(gl.BLEND);
    //gl.enable(gl.DEPTH_TEST);
    return super.deactivate();
  }

  setTime(t) {
    const { gl, uniforms } = this;
    gl.uniform1f(uniforms.t, t / 1000);
    return this;
  }
}

export default PortalShader;
