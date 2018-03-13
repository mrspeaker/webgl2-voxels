import Vec3 from "../lib/Vec3.js";

class Player {
  constructor(controls, camera, world) {
    this.controls = controls;
    this.world = world;
    this.camera = camera;
    this.pos = new Vec3(0, 20, -10);
    this.acc = new Vec3();
    this.vel = new Vec3();

    this.w = 0.6;
    this.h = 1.7;
    this.speed = 6;

    camera.transform.rotation.y = 180;
  }

  update(dt) {
    const { camera, world, pos, controls, vel, acc, speed } = this;
    const { transform } = camera;
    const { keys, mouse } = controls;

    let xo = 0;
    let yo = 0;
    let zo = 0;

    // TODO: using transform.forward/right means slow speed when looking down.
    if (keys.isDown(87 /*w*/) || keys.isDown(90 /*q*/) || keys.isDown(83)) {
      const dir = keys.isDown(83) ? 1 : -1;
      const v = dt * speed * dir;
      xo += transform.forward[0] * v;
      zo += transform.forward[2] * v;
    }
    if (
      keys.isDown(65 /*a*/) ||
      keys.isDown(81 /*q*/) ||
      keys.isDown(68 /*d*/)
    ) {
      const dir = keys.isDown(68) ? 1 : -1;
      const v = dt * speed * dir;
      xo += transform.right[0] * v;
      zo += transform.right[2] * v;
    }

    // Jump everybody
    if (keys.isDown(32) && vel.y <= 0) {
      acc.y = 0.25; // jump force
    }
    vel.y += acc.y;
    vel.y -= dt * 0.75; // gravity;
    yo = vel.y;

    // Check 12 points xo, yo (top, mid, bottom), zo against world.
    // TODO: this is super in-efficient! Fix it!
    const w = this.w / 2;
    const h = this.h / 2;
    [
      { x: pos.x - w, y: pos.y - h, z: pos.z - w, g: true },
      { x: pos.x + w, y: pos.y - h, z: pos.z - w, g: true },
      { x: pos.x - w, y: pos.y - h, z: pos.z + w, g: true },
      { x: pos.x + w, y: pos.y - h, z: pos.z + w, g: true },
      { x: pos.x - w, y: pos.y + 0, z: pos.z - w, m: true },
      { x: pos.x + w, y: pos.y + 0, z: pos.z - w, m: true },
      { x: pos.x - w, y: pos.y + 0, z: pos.z + w, m: true },
      { x: pos.x + w, y: pos.y + 0, z: pos.z + w, m: true },
      { x: pos.x - w, y: pos.y + h, z: pos.z - w, t: true },
      { x: pos.x + w, y: pos.y + h, z: pos.z - w, t: true },
      { x: pos.x - w, y: pos.y + h, z: pos.z + w, t: true },
      { x: pos.x + w, y: pos.y + h, z: pos.z + w, t: true }
    ].forEach(({ x, y, z, g, m, t }) => {
      let block;
      if (xo != 0 && world.getCell(x + xo, y, z)) xo = 0;
      if (zo != 0 && world.getCell(x + xo, y, z + zo)) zo = 0;
      if (yo != 0 && world.getCell(x + xo, y + yo, z + zo)) {
        // TODO: NOPe, need to check under feet "isOnGround"...
        // Issue is hits and falling: won't slide. Ray cast it.
        if (t || vel.y <= 0) {
          yo = 0;
          vel.y = 0;
        }
      }
    });

    pos.add(xo, yo, zo);

    // Bedrock
    if (pos.y + yo < 1.7 / 2) {
      yo = 0;
      pos.y = 1.7 / 2;
      vel.set(0, 0, 0);
    }

    acc.set(0, 0, 0);
  }
}

export default Player;
