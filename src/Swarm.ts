import * as Phaser from "phaser";

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
const MS_VORTEX_SCALE_DURATION = 500;

export class Swarm {
  #group: Phaser.Physics.Arcade.Group;
  #vortex: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  #x: number;
  #y: number;
  #enemyCount: number;
  get collider() {
    return this.#group;
  }
  constructor(
    private scene: Phaser.Scene,
    options: { x: number; y: number; enemyCount: number }
  ) {
    this.#x = options.x;
    this.#y = options.y;
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
    this.scene.load.spritesheet(
      Texture.VORTEX,
      "environment/force-field/force-field.png",
      {
        frameWidth: 16,
        frameHeight: 32,
      }
    );
  }
  create() {
    this.#group = this.scene.physics.add.group();

    this.createAnimations();
    this.createVortex();

    this.scene.time.addEvent({
      delay: Phaser.Math.Between(
        MS_PER_ENEMY_EXIT_VORTEX - 50,
        MS_PER_ENEMY_EXIT_VORTEX + 50
      ),
      repeat: this.#enemyCount,
      callback: () => {
        this.createEnemy();
      },
    });
  }
  private createEnemy() {
    const enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
      this.#group.create(
        this.#x,
        Phaser.Math.Between(this.#y, this.#y),
        Texture.LIZARD_MOVE
      );

    enemy.setVelocityX(-100).setOrigin(0.5);
  }
  private createAnimations() {
    this.scene.anims.create({
      key: Animation.LIZARD_RUN,
      frames: this.scene.anims.generateFrameNumbers(Texture.LIZARD_MOVE, {
        frames: [2, 0, 1],
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Animation.VORTEX,
      frames: this.scene.anims.generateFrameNumbers(Texture.VORTEX, {}),
      frameRate: 10,
      repeat: -1,
    });
  }
  private createVortex() {
    this.#vortex = this.scene.physics.add
      .staticSprite(0, 0, Texture.VORTEX)
      .setScale(2, 0)
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: this.#vortex,
      scale: 2,
      duration: MS_VORTEX_SCALE_DURATION,
      ease: "bounce.out",
    });
    this.scene.tweens.add({
      targets: this.#vortex,
      scale: 0,
      duration: MS_VORTEX_SCALE_DURATION,
      ease: "bounce.in",
      delay: (this.#enemyCount + 1) * MS_PER_ENEMY_EXIT_VORTEX,
    });
  }
  update() {
    this.updateVortex();
    this.spawnEnemies();
  }
  private updateVortex() {
    this.#vortex.setPosition(this.#x, this.#y);
    this.#vortex.anims.play(Animation.VORTEX, true);
  }
  private spawnEnemies() {
    this.#group.getChildren().forEach((enemy) => {
      if (
        !(
          enemy instanceof Phaser.Physics.Arcade.Sprite &&
          enemy.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      const toCropFrom = this.#vortex.x + this.#vortex.width;
      const toCrop = enemy.x - toCropFrom + enemy.width;
      const isOverlappingEndOfVortex =
        enemy.y + enemy.displayHeight >
        this.#vortex.y + this.#vortex.displayHeight;

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
