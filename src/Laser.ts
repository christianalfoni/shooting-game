import * as Phaser from "phaser";

enum Spritesheet {
  LASER = "LASER",
}

enum Animation {
  SHOOT = "SHOOT",
}

export class Laser {
  group: Phaser.Physics.Arcade.Group;
  #lastShot = 0;
  #state: "idle" | "shooting" = "idle";
  shotsFired = 0;
  constructor(private scene: Phaser.Scene) {}
  preload() {
    this.scene.load.spritesheet(
      Spritesheet.LASER,
      "fx/spritesheets/player-shoot.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
  }
  create() {
    this.group = this.scene.physics.add.group(undefined, {
      allowGravity: false,
    });
    this.scene.anims.create({
      key: Animation.SHOOT,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.LASER, {}),
      frameRate: 8,
      repeat: -1,
    });
  }
  update(playerX: number, playerY: number) {
    this.group.setVelocityX(100);

    if (this.#state === "shooting") {
      if (this.#lastShot > 200) {
        const laser: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
          this.group.create(playerX + 20, playerY + 3, Spritesheet.LASER);

        laser.body.setAllowGravity(false);

        laser.anims.play(Animation.SHOOT, true);

        this.#lastShot = 0;
        this.shotsFired++;
      }

      this.#lastShot += this.scene.game.loop.delta;
    } else {
      this.#lastShot = 0;
    }
  }
  shoot() {
    this.#state = "shooting";
  }
  idle() {
    this.#state = "idle";
  }
  reload() {
    this.shotsFired = 0;
  }
}
