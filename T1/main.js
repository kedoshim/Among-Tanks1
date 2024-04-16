import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  SecondaryBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

import { CameraControls } from "./camera.js";
import { Player } from "./entities/player.js";
import { ProjectileCollisionSystem } from "./CollisionSystem/collisionSystem.js";

import { getConfig, loadConfig } from "./config.js";
import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";
import { GameManager } from "./GameManager.js";

function frame() {}


async function main() {
  let manager = new GameManager(null,"a");
  await manager.initialize();
  manager.load();
  manager.loadLevel(manager.levelDecoded.blocks, manager.levelDecoded.offset);
  manager.loadPlayers();
  //manager.drawWalls(manager.levelDecoded.blocks, manager.levelDecoded.offset)

  const resetFunction = async (renderer) => {
    console.log("end");
    manager = "minha bunda";
    manager = new GameManager(renderer, "b");
    await manager.initialize();
    manager.load();
    manager.loadLevel(manager.levelDecoded.blocks, manager.levelDecoded.offset);
    manager.loadPlayers();

    manager.setResetFunction(resetFunction);
  };

  manager.setResetFunction(resetFunction)

  async function render() {
    await manager.frame();
    requestAnimationFrame(render);
    manager.render();
  }

  render();
}

main();
// function render(manager) {
//   manager.frame();
//   requestAnimationFrame(render)
//   manager.render();
// }

// window.addEventListener('DOMContentLoaded', () => {
//   render(gameManager); // Agora o this dentro de frame() se refere a gameManager
// });
