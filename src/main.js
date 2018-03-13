import glUtils from "../lib/glUtils.js";

import Cube from "../models/Cube.js";
import GridAxis from "../models/GridAxis.js";
import GridAxisShader from "../shaders/GridAxisShader.js";
import SkyboxShader from "../shaders/SkyboxShader.js";
import FogShader from "../shaders/FogShader.js";
import Camera from "./Camera.js";
import CameraController from "../controls/CameraController.js";
import KeyboardControls from "../controls/KeyboardControls.js";

import Player from "./Player.js";
import World from "./World.js";

const gl = document.querySelector("canvas").getContext("webgl2");
glUtils.fitScreen(gl);
gl.canvas.onclick = () => gl.canvas.requestPointerLock();

const camera = new Camera(gl);
camera.mode = Camera.MODE_FREE;
const controls = {
  keys: new KeyboardControls(gl.canvas),
  mouse: new CameraController(gl, camera)
}

// Shaders
const fogShader = new FogShader(gl, camera.projectionMatrix);
const gridAxis = GridAxis.create(gl);
const gridShader = new GridAxisShader(gl, camera.projectionMatrix);
const skybox = Cube.create(gl, "Skybox", 100, 100, 100);
const skyboxShader = new SkyboxShader(gl, camera.projectionMatrix);

const world = new World(gl);
const player = new Player(controls, camera, world);

// MAIN
preload()
  .then(res => initialize(res))
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
      { name: "uv", src: "res/crate.png", type: "tex" },
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
  glUtils.loadCubeMap(
    gl,
    "skybox",
    imgs.filter(i => i.name.startsWith("cube")).map(i => i.img)
  );
  skyboxShader.setCube(glUtils.textures.skybox);
  fogShader.setTexture(glUtils.textures.uv);

  // Initialize webgl
  gl.clearColor(1, 1, 1, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Set up initial chunks
  world.rechunk(0.15);
}

let dt = 0;
let last;
function loopy(t) {
  requestAnimationFrame(loopy);
  dt = (t - (last || t)) / 1000;
  last = t;

  player.update(dt);
  world.update(dt);

  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  // Sync camera to player
  camera.transform.position.setv(player.pos).add(0, player.h / 2, 0);
  camera.updateViewMatrix();

  // E key to gen new chunk
  if (controls.keys.isDown(69)) {
    keys[69] = false;
    world.rechunk(Math.random() * 0.2);
  }

  skyboxShader
    .activate()
    .preRender()
    .setCamera(camera.view)
    .renderModel(skybox);

  gridShader
    .activate()
    .setCamera(camera.view)
    .renderModel(gridAxis.preRender());

  fogShader
    .activate()
    .preRender()
    .setCamera(camera.view);

  world.chunks.forEach(cr => {
    fogShader.renderModel(cr.preRender());
  });
}
