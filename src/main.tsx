import * as Phaser from "phaser";
import { LevelProgress } from "./LevelProgress";
import { Player } from "./Player";
import { Swarm } from "./Swarm";
import { EnemyType, TextureData } from "./types";
import { Vortex } from "./Vortex";

enum Texture {
  FLOOR,
}

class Game extends Phaser.Scene {
  #player = new Player(this);
  #Textures: TextureData[] = [
    {
      name: "floor",
      file: "floor.png",
    },
  ];
  #floor: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  #vortex = new Vortex(this, { x: 240, y: 200 });
  #swarm = new Swarm(this, {
    vortex: this.#vortex,
    enemyCount: 10,
    enemyType: EnemyType.LIZARD,
  });

  #levelProgress = new LevelProgress(this, {
    enemies: [{ totalCount: 10, type: EnemyType.LIZARD, count: 0 }],
  });
  preload() {
    this.#Textures.forEach((texture) => {
      this.load.image(texture.name, texture.file);
    });
    this.#vortex.preload();
    this.#player.preload();
    this.#swarm.preload();
    this.#levelProgress.preload();
  }
  create() {
    this.#vortex.create();
    this.#player.create();
    this.#swarm.create();
    this.#levelProgress.create();
    this.#floor = this.physics.add.staticSprite(
      10,
      325,
      this.#Textures[Texture.FLOOR].name
    );
  }
  update() {
    this.physics.collide(this.#floor, this.#player.colliders.player);
    this.physics.collide(this.#floor, this.#swarm.collider);
    this.physics.collide(
      this.#player.colliders.laser,
      this.#swarm.collider,
      (laser, enemy) => {
        laser.destroy();
        this.#swarm.kill(
          enemy as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
        );
        this.#levelProgress.increaseEnemyCount(EnemyType.LIZARD);
      }
    );

    this.#vortex.update();
    this.#player.update();
    this.#swarm.update();
    this.#levelProgress.update();
  }
}

const game = new Phaser.Game({
  width: 500,
  height: 340,
  backgroundColor: "#151123",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1000 }, debug: false },
  },
  parent: "root",
  autoFocus: false,
  scale: {
    mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    zoom: 1,
  },
  antialias: false,
});

game.scene.add("game", Game);

game.scene.start("game");

document.getElementById("root")?.addEventListener("click", () => {
  window.focus();
});
