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

const MS_VORTEX_SCALE_DURATION = 500;

export class Vortex {
  #vortex: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  #x: number;
  #y: number;
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get width() {
    return this.#vortex.displayWidth;
  }
  get height() {
    return this.#vortex.displayHeight;
  }
  constructor(private scene: Phaser.Scene, options: { x: number; y: number }) {
    this.#x = options.x;
    this.#y = options.y;
  }
  preload() {
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
    this.#vortex = this.scene.physics.add
      .staticSprite(0, 0, Texture.VORTEX)
      .setScale(2, 0)
      .setOrigin(0.5)
      .setPosition(this.#x, this.#y);

    this.scene.anims.create({
      key: Animation.VORTEX,
      frames: this.scene.anims.generateFrameNumbers(Texture.VORTEX, {}),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.tweens.add({
      targets: this.#vortex,
      scale: 2,
      duration: MS_VORTEX_SCALE_DURATION,
      ease: "bounce.out",
    });
  }

  update() {
    if (!this.#vortex.active) {
      return;
    }

    this.#vortex.anims.play(Animation.VORTEX, true);
  }
  close() {
    if (!this.#vortex.active) {
      return;
    }

    this.scene.tweens.add({
      targets: this.#vortex,
      scale: 0,
      duration: MS_VORTEX_SCALE_DURATION,
      ease: "bounce.in",
      onComplete: () => {
        this.#vortex.destroy();
      },
    });
  }
}
