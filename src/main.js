import GridAxisShader from "../shaders/GridAxisShader.js";
import SkyboxShader from "../shaders/SkyboxShader.js";
import VoxelShader from "../shaders/VoxelShader.js";

import CameraController from "../controls/CameraController.js";
import KeyboardControls from "../controls/KeyboardControls.js";

import Camera from "./Camera.js";
import Chunk from "./Chunk.js";
import World from "./World.js";
import Player from "./Player.js";
import Cube from "../models/Cube.js";
import GridAxis from "../models/GridAxis.js";
import Ray from "../lib/Ray.js";
import glUtils from "../lib/glUtils.js";

const gl = document.querySelector("canvas").getContext("webgl2");
glUtils.fitScreen(gl);
gl.canvas.onclick = () => gl.canvas.requestPointerLock();
window.addEventListener("resize", () => glUtils.fitScreen(gl), false);
const deb1 = document.querySelector("#deb1");

const camera = new Camera(gl);
camera.mode = Camera.MODE_FREE;
const controls = {
  keys: new KeyboardControls(gl.canvas),
  mouse: new CameraController(gl, camera)
};

// Shaders
const voxelShader = new VoxelShader(gl, camera.projectionMatrix);
const gridAxis = GridAxis.create(gl);
const gridShader = new GridAxisShader(gl, camera.projectionMatrix);
const skybox = Cube.create(gl, "Skybox", 300, 300, 300);
const skyboxShader = new SkyboxShader(gl, camera.projectionMatrix);

const cloud = Cube.create(gl, "cloud", 10, 0.2, 3);
cloud.setPosition(0, 35, 0);

const world = new World(gl);
const player = new Player(controls, camera, world);
const ray = new Ray(camera);
const cube = Cube.create(gl);
cube.setScale(1.01);
cube.mesh.drawMode = gl.LINES;

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
      { name: "cube0", src: "res/mc_rt.png", type: "img" },
      { name: "cube1", src: "res/mc_lf.png", type: "img" },
      { name: "cube2", src: "res/mc_up.png", type: "img" },
      { name: "cube3", src: "res/mc_dn.png", type: "img" },
      { name: "cube4", src: "res/mc_bk.png", type: "img" },
      { name: "cube5", src: "res/mc_ft.png", type: "img" }
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

  // Initialize webgl
  gl.clearColor(1, 1, 1, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Set up initial chunks with density 10
  world.gen(10);
}

function loopy(t, last = t) {
  requestAnimationFrame(time => loopy(time, t));
  const dt = Math.min(t - last, 100) / 1000;

  player.update(dt);
  world.update(dt);

  const { pos } = player;

  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  // Sync camera to player
  camera.transform.position.setv(pos).add(0, player.h / 2, 0);
  camera.updateViewMatrix();

  // E key to gen new chunk
  if (controls.keys.isDown(69)) {
    controls.keys[69] = false;
    world.gen();
    pos.y = 40;
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
    cube.setPosition(block.x, block.y, block.z);
    cube.addPosition(0.5, 0.5, 0.5);
    const isShiftKey = controls.keys.isDown(16);
    const isRightClick = controls.mouse.isRight;

    const isRemoveBlock = isShiftKey;
    const isDestructoMode = !isShiftKey && isRightClick;
    const isAddBlock = !isRemoveBlock && !isDestructoMode;

    if (isAddBlock) {
      cube.addPosition(...Chunk.FACES[block.face].n);
    }
    if (controls.mouse.isDown) {
      // Limit to one-action-per-click, except destructo mode
      if (!isDestructoMode) {
        controls.mouse.isDown = false;
      }

      // Add or remove block
      const n = Chunk.FACES[block.face].n;
      const xo = isAddBlock ? n[0] : 0;
      const yo = isAddBlock ? n[1] : 0;
      const zo = isAddBlock ? n[2] : 0;
      const diggingGround = !isAddBlock && block.y === 0;

      if (!diggingGround) {
        if (!player.testCell(block.x + xo, block.y + yo, block.z + zo)) {
          const ch = world.setCell(
            block.x + xo,
            block.y + yo,
            block.z + zo,
            isAddBlock ? 3 : 0
          );
          if (ch) ch.rechunk();
        }
      }
    }
  }

  const chunk = world.getChunk(pos.x, pos.y, pos.z);
  const p = `${pos.x.toFixed(2)}:${pos.y.toFixed(2)}:${pos.z.toFixed(2)}`;
  deb1.innerHTML = `${p}<br/>${
    !chunk ? "-" : `${chunk.chunk.chX}:${chunk.chunk.chY}:${chunk.chunk.chZ}`
  }<br/>`;

  cloud.transform.position.x -= 0.3 * dt;
  if (cloud.transform.position.x < - 32) {
    cloud.transform.position.x += 64;
  }

  // Render
  skyboxShader
    .activate()
    .setTime(t / 80)
    .preRender()
    .setCamera(camera.view)
    .renderModel(skybox);

  gridShader
    .activate()
    .setCamera(camera.view)
    .renderModel(cloud.preRender())
    .renderModel(gridAxis.preRender());

  voxelShader
    .activate()
    .preRender()
    .setCamera(camera.view)
    .renderModel(cube.preRender());

  world.chunks.forEach(cr => {
    voxelShader.renderModel(cr.preRender());
  });
}
