import Vec3 from "./Vec3.js";
import m4 from "../../vendor/m4.js";

class Ray {
  constructor(camera) {
    this.camera = camera;
  }

  fromScreen(sx, sy, screenW, screenH) {
    const { camera } = this;

    const x = sx / screenW * 2 - 1;
    const y = 1 - sy / screenH * 2;

    const invPers = m4.inverse(camera.projectionMatrix);
    const invView = m4.inverse(camera.view);
    const toWorld = m4.multiply(invView, invPers);

    const from = m4.transformVector(toWorld, [x, y, -1, 1]);
    const near = new Vec3(
      from[0] / from[3],
      from[1] / from[3],
      from[2] / from[3]
    );
    const to = m4.transformVector(toWorld, [x, y, 1, 1]);
    const far = new Vec3(to[0] / to[3], to[1] / to[3], to[2] / to[3]);

    // Alternative: just make ray direction - not near/far.
    const rayClip = [x, y, 1, 1];
    const rayEye = m4.transformVector(invPers, rayClip);
    rayEye[2] = -1; // Reset z (needed? Always seems -1 after invPers)
    rayEye[3] = 0; // Reset 0 (needed: sometimes very low value.)
    const rayWorld = m4.transformVector(invView, rayEye);
    const ray = new Vec3(rayWorld[0], rayWorld[1], rayWorld[2]).normalize();
    return { near, far, ray };
  }
}

export default Ray;
