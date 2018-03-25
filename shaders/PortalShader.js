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
    float w = sin((vpos.x * 35.) * .15);
    float w2 = sin((vpos.y * 35.) * .15 + t / 0.5);
    float r = abs(cos(t / 3.0 + vpos.x * vpos.y * 1.9 + w2)) / 1.8;
    float g = sin(t / 2.0 + vpos.y * vpos.x * 2.0) / 5.;
    float b = 0.0;
    vec3 c = vec3(1.0 + (w + w2) / 5.);
    col = vec4(c* vec3(r, g, b), 0.7);
  }
`;

class PortalShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vs, fs);
    this.setUniforms("proj", pMatrix);
  }

  activate() {
    const { gl } = this;
    super.activate();
    gl.enable(gl.BLEND);
    return this;
  }

  deactivate() {
    const { gl } = this;
    gl.disable(gl.BLEND);
    return super.deactivate();
  }
}

export default PortalShader;
