import Chunk from "./Chunk.js";

const digAndBuild = (block, controls, world, player, blockType = 3) => {
  if (!controls.mouse.isDown) {
    return;
  }

  const isShiftKey = controls.keys.isDown(16);
  const isRightClick = controls.mouse.isRight;
  const isDestructoMode = !isShiftKey && isRightClick;
  const isAdd = !isShiftKey && !isDestructoMode;

  // Limit to one-action-per-click, except destructo mode
  if (!isDestructoMode) {
    controls.mouse.isDown = false;
  }

  // Block coord, plus normal direction when adding
  const n = Chunk.FACES[block.face].n;
  const x = block.x + (isAdd ? n[0] : 0);
  const y = block.y + (isAdd ? n[1] : 0);
  const z = block.z + (isAdd ? n[2] : 0);

  const isBedrock = !isAdd && block.y <= 0;
  const isPortalChunk = y >= 16;
  const playerBlocked = isAdd && player.testCell(x, y, z);
  if (isBedrock || isPortalChunk || playerBlocked) {
    return;
  }

  const ch = world.setCell(x, y, z, isAdd ? blockType : 0);
  if (ch) ch.rechunk();
};

export default digAndBuild;
