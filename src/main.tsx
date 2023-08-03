import * as Phaser from "phaser";
import { Player } from "./Player";
import { Swarm } from "./Swarm";
import { Texture } from "./types";

enum TextureId {
  FLOOR,
}

class Game extends Phaser.Scene {
  #player = new Player(this);
  #Textures: Texture[] = [
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
      this.#Textures[TextureId.FLOOR].name
    );
  }
  update() {
    this.physics.collide(this.#floor, this.#player.sprite);
    this.#swarm.collideWith(this.#floor);
    this.#swarm.collideWith(this.#player.laser.group, (enemy, laser) => {
      laser.destroy();
      this.#swarm.kill(
        enemy as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      );
    });
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
