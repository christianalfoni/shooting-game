import * as Phaser from "phaser";
import { Player } from "./Player";
import { Swarm } from "./Swarm";
import { TextureData } from "./types";

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
  #swarm = new Swarm(this, {
    x: 240,
    y: 200,
    enemyCount: 10,
  });
  preload() {
    this.#Textures.forEach((texture) => {
      this.load.image(texture.name, texture.file);
    });
    this.#player.preload();
    this.#swarm.preload();
  }
  create() {
    this.#player.create();
    this.#swarm.create();
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
      }
    );

    this.#player.update();
    this.#swarm.update();
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
