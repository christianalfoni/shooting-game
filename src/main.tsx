import * as Phaser from "phaser";
import { Player } from "./Player";
import { Texture } from "./types";

enum TextureId {
  PLAYER,
  ENEMY,
  BULLET,
  FLOOR,
}

class Game extends Phaser.Scene {
  #player = new Player(this);
  #Textures: Texture[] = [
    {
      name: "player",
      file: "player.png",
    },
    {
      name: "enemy",
      file: "enemy.png",
    },
    {
      name: "bullet",
      file: "bullet.png",
    },
    {
      name: "floor",
      file: "floor.png",
    },
  ];
  #floor: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  #swarm: Phaser.Physics.Arcade.Group;
  preload() {
    this.#Textures.forEach((texture) => {
      this.load.image(texture.name, texture.file);
    });
    this.#player.preload();
  }
  create() {
    this.#player.create();
    this.#floor = this.physics.add.staticSprite(
      10,
      325,
      this.#Textures[TextureId.FLOOR].name
    );

    this.#swarm = this.physics.add.group();
    this.time.addEvent({
      delay: 50,
      repeat: 10,
      callback: () => {
        const enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
          this.#swarm.create(
            100,
            Phaser.Math.Between(150, 200),
            this.#Textures[TextureId.ENEMY].name
          );
        enemy.setAccelerationX(-50);
      },
    });
  }
  update() {
    this.physics.collide(this.#floor, this.#player.sprite);
    this.physics.collide(this.#floor, this.#swarm);
    this.physics.collide(this.#player.laser.group, this.#swarm, (a, b) => {
      a.destroy();
      b.destroy();
    });

    this.#player.update();

    this.#swarm.getChildren().forEach((enemy) => {
      if (
        !(
          enemy instanceof Phaser.Physics.Arcade.Sprite &&
          enemy.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      if (enemy.body.onFloor()) {
        enemy.setVelocityY(-100);
      }
    });
  }
}

const game = new Phaser.Game({
  width: 500,
  height: 340,
  backgroundColor: "#151123",
  physics: { default: "arcade", arcade: { gravity: { y: 1000 } } },
  parent: "root",
  autoFocus: false,
  scale: {
    mode: Phaser.Scale.ZOOM_2X,
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
