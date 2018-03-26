import SkyboxShader from "../shaders/SkyboxShader.js";
import VoxelShader from "../shaders/VoxelShader.js";
import PortalShader from "../shaders/PortalShader.js";
import DebugShader from "../shaders/DebugShader.js";

import CameraController from "../controls/CameraController.js";
import KeyboardControls from "../controls/KeyboardControls.js";

import Camera from "./Camera.js";
import World from "./World.js";
import Player from "./Player.js";
import Cube from "../models/Cube.js";
import Ray from "../lib/Ray.js";
import glUtils from "../lib/glUtils.js";

import digAndBuild from "./digAndBuild.js";
import goog from "./goog.js";

const gl = document.querySelector("canvas").getContext("webgl2");
if (!gl) {
  document.querySelector("#nowebgl2").style.display = "block";
  goog.noWebGL2();
}
glUtils.fitScreen(gl);
gl.canvas.onclick = () => gl.canvas.requestPointerLock();
window.addEventListener("resize", () => glUtils.fitScreen(gl), false);
const deb1 = document.querySelector("#deb1");
const ad1 = document.querySelector("#ad");

const camera = new Camera(gl);
camera.mode = Camera.MODE_FREE;
const controls = {
  keys: new KeyboardControls(gl.canvas),
  mouse: new CameraController(gl, camera)
};

// Shaders
const voxelShader = new VoxelShader(gl, camera.projectionMatrix);
const portalShader = new PortalShader(gl, camera.projectionMatrix);
const skybox = Cube.create(gl, "Skybox", 300, 300, 300);
const skyboxShader = new SkyboxShader(gl, camera.projectionMatrix);
const debugShader = new DebugShader(gl, camera.projectionMatrix);

const world = new World(gl);
const player = new Player(controls, camera, world);
player.pos.set(3, 19, 0.3);
const ray = new Ray(camera);
const cursor = Cube.create(gl);
cursor.scale.set(1.001, 1.001, 1.001);
//cursor.mesh.drawMode = gl.LINES;
cursor.mesh.doBlending = true;
cursor.mesh.noCulling = false;

const state = {
  lastGen: Date.now()
};

// MAIN
preload()
  .then(initialize)
  .then(() => requestAnimationFrame(t => loopy(t, t, state)));

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
      { name: "cube0", src: "res/mc_rt.png", type: "img" },
      { name: "cube1", src: "res/mc_lf.png", type: "img" },
      { name: "cube2", src: "res/mc_up.png", type: "img" },
      { name: "cube3", src: "res/mc_dn.png", type: "img" },
      { name: "cube4", src: "res/mc_bk.png", type: "img" },
      { name: "cube5", src: "res/mc_ft.png", type: "img" },
      { name: "ad", src: "res/html5games.png", type: "tex" }
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
  voxelShader.setTexture(glUtils.textures.blocks);
  debugShader.setTexture(glUtils.textures.ad);

  // Initialize webgl
  gl.clearColor(1, 1, 1, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Set up initial chunks with density 10
  world.gen(10);
}

function loopy(t, last = t, state) {
  requestAnimationFrame(time => loopy(time, t, state));
  const dt = Math.min(t - last, 100) / 1000;

  player.update(dt);
  world.update(dt);

  const { pos } = player;

  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  // Sync camera to player
  camera.transform.position.setv(pos).add(0, player.h / 2, 0);
  camera.updateViewMatrix();

  const regenWorld = () => {
    controls.keys.keys[69] = false;
    player.pos.set(3, 19, 0.3);
    world.gen();
    state.lastGen = Date.now();
  };

  // E key to gen new chunk
  if (controls.keys.isDown(69)) {
    if (Date.now() - state.lastGen > 1000) {
      regenWorld();
      goog.newWorld();
    }
  }

  if (controls.keys.isDown(66)) {
    controls.keys.keys[66] = false;
    window.location.href = "http://www.mrspeaker.net/html5-games-book/";
    goog.lookBook();
  }

  // Get block player is looking at
  const r = ray.fromScreen(
    gl.canvas.width / 2,
    gl.canvas.height / 2,
    gl.canvas.width,
    gl.canvas.height
  );

  const block = world.getCellFromRay(camera.transform.position, r.ray);
  if (block) {
    digAndBuild(block, controls, world, player);
    cursor.position.set(block.x, block.y, block.z);
    cursor.position.add(0.5, 0.5, 0.5);
  }

  if (world.didTriggerPortal(player.pos, dt)) {
    regenWorld();
  }

  if (world.didTriggerAd(player.pos)) {
    ad1.style.display = "block";
  } else {
    ad1.style.display = "none";
  }

  // Render
  skyboxShader
    .activate()
    .preRender("camera", camera.view, "t", t / 80)
    .render(skybox);

  voxelShader
    .activate()
    .preRender("camera", camera.view)
    .render(world.chunks);

  debugShader
    .activate()
    .preRender("camera", camera.view, "colour", [1.0, 1.0, 0.0, 0.1], "useTex", 0.0)
    .render(cursor)
    .setUniforms("colour", [1, 1, 1, 0.1], "tex", 0, "useTex", 1.0)
    .render(world.ad.renderable);

  world.ad.renderable.rotation.x += dt * 30.0;
  world.ad.renderable.rotation.y += dt * 27.0;
  world.ad.renderable.rotation.z += dt * 21.0;
  world.ad.renderable.position.y += Math.sin(t / 300) * 0.01;

  portalShader
    .activate()
    .preRender(
      "camera",
      camera.view,
      "t",
      t / 1000,
      "whirl",
      world.portal.timeInPortal / 2
    )
    .render(world.portal.renderable)
    .deactivate();

  // Debug
  const chunk = world.getChunk(pos.x, pos.y, pos.z);
  const p = `${pos.x.toFixed(2)}:${pos.y.toFixed(2)}:${pos.z.toFixed(2)}`;
  deb1.innerHTML = `${p}<br/>${
    !chunk ? "-" : `${chunk.chunk.chX}:${chunk.chunk.chY}:${chunk.chunk.chZ}`
  }<br/>`;
}
