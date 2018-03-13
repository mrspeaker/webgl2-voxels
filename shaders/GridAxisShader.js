import Shader from "./Shader.js";

const vs = `#version 300 es
  uniform mat4 view;
  uniform mat4 proj;
  uniform mat4 camera;
  uniform vec3 colours[4];

  layout(location=0) in vec3 pos;
  layout(location=4) in float col;

  out lowp vec4 vcol;
  void main() {
    vcol = vec4(colours[int(col)], 1.0);
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

class GridAxisShader extends Shader {
  constructor(gl, pMatrix) {
    super(gl, vs, fs);
    const { uniforms } = this;

    this.setPerspective(pMatrix);

    gl.uniform3fv(
      uniforms["colours"],
      new Float32Array([0.8, 0.8, 0.8, 1, 0, 0, 0, 1, 0, 0, 0, 1])
    );
  }
}

export default GridAxisShader;
