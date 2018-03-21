import glUtils from "../lib/glUtils.js";
import Vec3 from "../lib/Vec3.js";
import Cube from "../models/Cube.js";
import GridAxis from "../models/GridAxis.js";
import GridAxisShader from "../shaders/GridAxisShader.js";
import SkyboxShader from "../shaders/SkyboxShader.js";
import FogShader from "../shaders/FogShader.js";
import Camera from "./Camera.js";
import CameraController from "../controls/CameraController.js";
import KeyboardControls from "../controls/KeyboardControls.js";
import Line from "../models/Line.js";

import Player from "./Player.js";
import World from "./World.js";
import Ray from "../lib/Ray.js";

const gl = document.querySelector("canvas").getContext("webgl2");
glUtils.fitScreen(gl);
gl.canvas.onclick = () => gl.canvas.requestPointerLock();
window.addEventListener("resize", () => glUtils.fitScreen(gl), false);

const camera = new Camera(gl);
camera.mode = Camera.MODE_FREE;
const controls = {
  keys: new KeyboardControls(gl.canvas),
  mouse: new CameraController(gl, camera)
};

// Shaders
const fogShader = new FogShader(gl, camera.projectionMatrix);
const gridAxis = GridAxis.create(gl);
const line = Line.create(gl);
const gridShader = new GridAxisShader(gl, camera.projectionMatrix);
const skybox = Cube.create(gl, "Skybox", 100, 100, 100);
const skyboxShader = new SkyboxShader(gl, camera.projectionMatrix);

const world = new World(gl);
const player = new Player(controls, camera, world);

const ray = new Ray(camera);
const cube = Cube.create(gl);
cube.setScale(1.1); //transform.scale(0.5);

// MAIN
preload()
  .then(initialize)
  .then(() => requestAnimationFrame(loopy));

function preload() {
  const loadImg = src =>
    new Promise(res => {
      const img = new Image();
      img.src = src;
      img.addEventListener("load", () => res(img), false);
    });

  return Promise.all(
    [
      { name: "blocks", src: "res/mine.png", type: "tex" },
      { name: "cube0", src: "res/whirlpool_rt.png", type: "img" },
      { name: "cube1", src: "res/whirlpool_lf.png", type: "img" },
      { name: "cube2", src: "res/whirlpool_up.png", type: "img" },
      { name: "cube3", src: "res/whirlpool_dn.png", type: "img" },
      { name: "cube4", src: "res/whirlpool_bk.png", type: "img" },
      { name: "cube5", src: "res/whirlpool_ft.png", type: "img" }
    ].map(
      ({ name, src, type }) =>
        new Promise(res => {
          switch (type) {
            case "tex":
            case "img":
              loadImg(src).then(img => res({ name, src, type, img }));
              break;
          }
        })
    )
  );
}

function initialize(res) {
  // Textures
  const texs = res.filter(i => i.type == "tex");
  const imgs = res.filter(i => i.type == "img");

  texs.forEach(i => glUtils.loadTexture(gl, i.name, i.img));

  const cubeImg = imgs.filter(i => i.name.startsWith("cube")).map(i => i.img);
  glUtils.loadCubeMap(gl, "skybox", cubeImg);
  skyboxShader.setCube(glUtils.textures.skybox);
  fogShader.setTexture(glUtils.textures.blocks);

  // Initialize webgl
  gl.clearColor(1, 1, 1, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Set up initial chunks
  world.rechunk(0.15);
}

const pos = {
  x: 0.5,
  y: 1.9,
  z: 0.5
};

const dir = {
  x: 1,
  y: -0.075,
  z: 0.0001
};
//const c = ray.fromScreen(0, 0, gl.canvas.width, gl.canvas.height);
const end = Vec3.from(dir)
  .scale(10)
  .addv(pos);
//line.mesh.addLine(Vec3.from(pos), new Vec3(0, 0, 0));
//line.mesh.addLine(Vec3.from(pos), end);

function loopy(t, last = t) {
  requestAnimationFrame(time => loopy(time, t));
  const dt = Math.min(t - last, 100) / 1000;

  player.update(dt);
  world.update(dt);

  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  // Sync camera to player
  camera.transform.position.setv(player.pos).add(0, player.h / 2, 0);
  camera.updateViewMatrix();

  // E key to gen new chunk
  if (controls.keys.isDown(69)) {
    controls.keys[69] = false;
    world.rechunk(Math.random() * 0.2);
  }

  const r = ray.fromScreen(
    gl.canvas.width / 2,
    gl.canvas.height / 2,
    gl.canvas.width,
    gl.canvas.height
  );

  line.mesh.remesh(new Vec3(r.near.x, r.near.y - 0.1, r.near.z), r.far);
  //const l = new Vec3(...camera.transform.forward);
  //l.scale(-2);
  if (controls.mouse.isDown) {
    controls.mouse.isDown = false;

    const cell = world.getCellFromRay(camera.transform.position, r.ray);
    if (cell) {
      cube.setPosition(cell.x, cell.y, cell.z);
      cube.addPosition(0.5, 0.5, 0.5);
      console.log(cell.face);
      const ch = world.setCell(cell.x, cell.y, cell.z, 0);
      if (ch) {
        ch.rechunk();
      }
    }
  }

  skyboxShader
    .activate()
    .preRender()
    .setCamera(camera.view)
    .renderModel(skybox);

  gridShader
    .activate()
    .setCamera(camera.view)
    //.renderModel(line.preRender())
    .renderModel(gridAxis.preRender());

  fogShader
    .activate()
    .preRender()
    .setCamera(camera.view)
    .renderModel(cube.preRender());

  world.chunks.forEach(cr => {
    fogShader.renderModel(cr.preRender());
  });
}
