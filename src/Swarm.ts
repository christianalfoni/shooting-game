import * as Phaser from "phaser";

enum Texture {
  LIZARD_MOVE = "LIZARD_MOVE",
  LIZARD_BLOOD = "LIZARD_BLOOD",
}

enum Animation {
  LIZARD_RUN = "LIZARD_RUN",
}

export class Swarm {
  group: Phaser.Physics.Arcade.Group;
  constructor(private scene: Phaser.Scene) {}
  preload() {
    this.scene.load.spritesheet(
      Texture.LIZARD_MOVE,
      "characters/enemies/spritesheet/lizard-move.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.scene.load.image(
      Texture.LIZARD_BLOOD,
      "characters/enemies/sprites/lizard/blood.png"
    );
  }
  create() {
    this.group = this.scene.physics.add.group();
    this.scene.anims.create({
      key: Animation.LIZARD_RUN,
      frames: this.scene.anims.generateFrameNumbers(Texture.LIZARD_MOVE, {
        frames: [2, 0, 1],
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.scene.time.addEvent({
      delay: 500,
      repeat: 5,
      callback: () => {
        const enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
          this.group.create(
            Phaser.Math.Between(240, 250),
            Phaser.Math.Between(200, 240),
            Texture.LIZARD_MOVE
          );
        enemy.setVelocityX(-50);
      },
    });
  }
  update() {
    this.group.getChildren().forEach((enemy) => {
      if (
        !(
          enemy instanceof Phaser.Physics.Arcade.Sprite &&
          enemy.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      if (enemy.body.onFloor()) {
        enemy.setVelocityY(-300);
        enemy.anims.play(Animation.LIZARD_RUN, false);
      }
    });
  }
  kill(enemy: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    const emitter = this.scene.add.particles(
      enemy.x,
      enemy.y,
      Texture.LIZARD_BLOOD
    );
    emitter.setConfig({
      quantity: 18,
      gravityY: 500,
      bounce: 0,
      speed: { min: -150, max: 150 },
      scale: { start: 2, end: 0.1 },
      lifespan: 800,
    });
    emitter.explode();
    enemy.destroy();
  }
}
