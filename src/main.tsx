import * as Phaser from "phaser";
import { Texture } from "./types";

enum TextureId {
  PLAYER,
  ENEMY,
  BULLET,
  FLOOR,
}

class Game extends Phaser.Scene {
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
  #player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  #keys: Phaser.Types.Input.Keyboard.CursorKeys;
  #swarm: Phaser.Physics.Arcade.Group;
  #bullets: Phaser.Physics.Arcade.Group;
  preload() {
    this.#Textures.forEach((texture) => {
      this.load.image(texture.name, texture.file);
    });
  }
  create() {
    this.#keys = this.input.keyboard!.createCursorKeys();
    this.#floor = this.physics.add.staticSprite(
      10,
      325,
      this.#Textures[TextureId.FLOOR].name
    );

    this.#player = this.physics.add.sprite(
      10,
      200,
      this.#Textures[TextureId.PLAYER].name
    );
    this.#player.setMaxVelocity(50, 1000);
    this.#player.setDrag(200);

    this.#bullets = this.physics.add.group(undefined, {
      allowGravity: false,
    });

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
    this.physics.collide(this.#floor, this.#player);
    this.physics.collide(this.#floor, this.#swarm);
    this.physics.collide(this.#bullets, this.#swarm, (a, b) => {
      a.destroy();
      b.destroy();
    });

    let velocityX = 0;

    if (this.#keys.left.isDown) {
      velocityX = -Math.min(this.#keys.left.getDuration() / 5, 20);
    } else if (this.#keys.right.isDown) {
      velocityX = Math.min(this.#keys.right.getDuration() / 5, 20);
    }

    this.#player.setVelocityX(velocityX);

    if (
      Phaser.Input.Keyboard.JustDown(this.#keys.up) &&
      this.#player.body.onFloor()
    ) {
      this.#player.body.velocity.y = -100;
    }

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

    this.#bullets.setVelocityX(100);

    if (this.#keys.space.isDown) {
      const bullet: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
        this.#bullets.create(
          this.#player.x,
          this.#player.y + 1,
          this.#Textures[TextureId.BULLET].name
        );

      bullet.body.setAllowGravity(false);
    }
  }
}

const game = new Phaser.Game({
  width: 500,
  height: 340,
  physics: { default: "arcade", arcade: { gravity: { y: 1000 } } },
  parent: "root",
  autoFocus: false,
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  min: {
    width: 250,
    height: 170,
  },
  max: {
    width: 1000,
    height: 680,
  },
});

game.scene.add("game", Game);

game.scene.start("game");
