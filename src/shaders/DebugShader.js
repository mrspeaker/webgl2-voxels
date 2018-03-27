import Shader from "./Shader.js";

const vs = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;
  uniform vec4 colour;

  layout(location=0) in vec3 pos;
  layout(location=2) in vec2 uv;

  out lowp vec4 vcol;
  out vec2 vuv;
  void main() {
    vcol = colour;
    vuv = uv;
    gl_Position = proj * camera * view * vec4(pos, 1.0);
  }
`;

const fs = `#version 300 es
  precision highp float;
  uniform sampler2D tex;
  uniform float useTex;
  in vec4 vcol;
  in vec2 vuv;

  out vec4 col;
  void main() {
    col = useTex == 1.0 ? texture(tex, vuv) : vcol;
  }
`;

class DebugShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vs, fs);
    this.setUniforms(
      "proj", pMatrix,
      "colour", [1.0, 1.0, 0.0, 0.1]
    );
  }
}

export default DebugShader;
