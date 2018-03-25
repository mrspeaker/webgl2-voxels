import Shader from "./Shader.js";

const vs = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;
  uniform vec4 colour;

  layout(location=0) in vec3 pos;

  out lowp vec4 vcol;
  void main() {
    vcol = colour;
    gl_Position = proj * camera * view * vec4(pos, 1.0);
  }
`;

const fs = `#version 300 es
  precision highp float;
  in vec4 vcol;

  out vec4 col;
  void main() {
    col = vcol;
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
