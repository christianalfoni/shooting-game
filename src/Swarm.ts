import * as Phaser from "phaser";
import { EnemyType } from "./types";
import { Vortex } from "./Vortex";

enum Texture {
  LIZARD_MOVE = "LIZARD_MOVE",
  LIZARD_BLOOD = "LIZARD_BLOOD",
  VORTEX = "VORTEX",
}

enum Animation {
  LIZARD_RUN = "LIZARD_RUN",
  VORTEX = "VORTEX",
}

const MS_PER_ENEMY_EXIT_VORTEX = 250;

export class Swarm {
  #group: Phaser.Physics.Arcade.Group;
  #vortex: Vortex;
  #enemyCount: number;
  get collider() {
    return this.#group;
  }
  constructor(
    private scene: Phaser.Scene,
    options: { vortex: Vortex; enemyCount: number; enemyType: EnemyType }
  ) {
    this.#vortex = options.vortex;
    this.#enemyCount = options.enemyCount;
  }
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
    this.#group = this.scene.physics.add.group();

    this.scene.anims.create({
      key: Animation.LIZARD_RUN,
      frames: this.scene.anims.generateFrameNumbers(Texture.LIZARD_MOVE, {
        frames: [2, 0, 1],
      }),
      frameRate: 5,
      repeat: -1,
    });

    let repeated = 0;
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(
        MS_PER_ENEMY_EXIT_VORTEX - 50,
        MS_PER_ENEMY_EXIT_VORTEX + 50
      ),
      repeat: this.#enemyCount - 1,
      callback: () => {
        this.createEnemy();

        repeated++;

        if (repeated === this.#enemyCount) {
          this.scene.time.addEvent({
            delay: 200,
            callback: () => {
              this.#vortex.close();
            },
          });
        }
      },
    });
  }
  private createEnemy() {
    const enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
      this.#group.create(
        this.#vortex.x,
        Phaser.Math.Between(this.#vortex.y - 16, this.#vortex.y + 16),
        Texture.LIZARD_MOVE
      );

    enemy.setVelocityX(-100).setOrigin(0.5);
  }

  update() {
    this.#group.getChildren().forEach((enemy) => {
      if (
        !(
          enemy instanceof Phaser.Physics.Arcade.Sprite &&
          enemy.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      const toCropFrom = this.#vortex.x + this.#vortex.width / 2;
      const toCrop = enemy.x - toCropFrom + enemy.width;
      const isOverlappingEndOfVortex =
        enemy.y + enemy.displayHeight > this.#vortex.y + this.#vortex.height;

      if (toCrop > 0 && !isOverlappingEndOfVortex) {
        enemy.setCrop(0, 0, 32 - toCrop, 32);
      } else {
        enemy.setCrop();
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
