import * as Phaser from "phaser";

enum Spritesheet {
  LASER = "LASER",
  LASER_FADE = "LASER_FADE",
}

enum Animation {
  SHOOT = "SHOOT",
  SHOOT_FADE = "SHOOT_FADE",
}

export class Laser {
  group: Phaser.Physics.Arcade.Group;
  #fadingGroup: Phaser.Physics.Arcade.Group;
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
    this.scene.load.spritesheet(
      Spritesheet.LASER_FADE,
      "fx/spritesheets/player-shoot-hit.png",
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
    this.#fadingGroup = this.scene.physics.add.group(undefined, {
      allowGravity: false,
    });
    this.scene.anims.create({
      key: Animation.SHOOT,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.LASER, {}),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Animation.SHOOT_FADE,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.LASER_FADE, {}),
      frameRate: 24,
    });
  }
  update(playerX: number, playerY: number) {
    this.group.setVelocityX(200);
    this.#fadingGroup.setVelocityX(200);

    if (this.#state === "shooting") {
      if (this.#lastShot > 250) {
        const x = playerX + 40;
        const laser: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody =
          this.group.create(x, playerY + 3, Spritesheet.LASER);

        laser.body.setAllowGravity(false);
        laser.setData("initialX", x);
        laser.anims.play(Animation.SHOOT, true);
        laser.setScale(2);
        laser.setBodySize(10, 16);

        this.#lastShot = 0;
        this.shotsFired++;
      }

      this.#lastShot += this.scene.game.loop.delta;
    } else {
      this.#lastShot = 0;
    }

    this.group.getChildren().forEach((laser) => {
      if (
        !(
          laser instanceof Phaser.Physics.Arcade.Sprite &&
          laser.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      const initialX = laser.getData("initialX") as number;

      if (laser.x > initialX + 60) {
        this.group.remove(laser);
        laser.anims.play(Animation.SHOOT_FADE, false);
        this.#fadingGroup.add(laser);
      }
    });

    this.#fadingGroup.getChildren().forEach((laser) => {
      if (
        !(
          laser instanceof Phaser.Physics.Arcade.Sprite &&
          laser.body instanceof Phaser.Physics.Arcade.Body
        )
      ) {
        return;
      }

      laser.body.setAllowGravity(false);

      const initialX = laser.getData("initialX") as number;

      if (laser.x > initialX + 100) {
        laser.destroy();
      }
    });
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
