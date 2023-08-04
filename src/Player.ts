import { Battery } from "./Battery";
import { Laser } from "./Laser";

enum Spritesheet {
  PLAYER_IDLE = "PLAYER_IDLE",
  LASER = "LASER",
  PLAYER_RUN = "PLAYER_RUN",
  PLAYER_SHOOT = "PLAYER_SHOOT",
}

enum Animation {
  PLAYER_IDLE = "PLAYER_IDLE",
  PLAYER_RUN_RIGHT = "PLAYER_RUN_RIGHT",
  PLAYER_RUN_LEFT = "PLAYER_RUN_LEFT",
  PLAYER_SHOOT = "PLAYER_SHOOT",
  PLAYER_RELOADING = "PLAYER_RELOADING",
}

export class Player {
  #sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  #laser: Laser;
  #keys: Phaser.Types.Input.Keyboard.CursorKeys;
  #state: "IDLE" | "RUNNING" | "RUNNING_BACKWARDS" | "SHOOTING" | "RELOADING" =
    "IDLE";
  #shotsToFire = 5;
  #reloadKey: Phaser.Input.Keyboard.Key;
  #battery: Battery;
  get colliders() {
    return {
      player: this.#sprite,
      laser: this.#laser.collider,
    };
  }
  constructor(private scene: Phaser.Scene) {
    this.#laser = new Laser(scene);
    this.#battery = new Battery(scene);
  }
  preload() {
    this.scene.load.spritesheet(
      Spritesheet.PLAYER_IDLE,
      "characters/player/spritesheets/player-idle.png",
      {
        frameWidth: 32,
        frameHeight: 38,
      }
    );
    this.scene.load.spritesheet(
      Spritesheet.PLAYER_RUN,
      "characters/player/spritesheets/player-run.png",
      {
        frameWidth: 32,
        frameHeight: 38,
      }
    );
    this.scene.load.spritesheet(
      Spritesheet.PLAYER_SHOOT,
      "characters/player/spritesheets/player-shoot.png",
      {
        frameWidth: 32,
        frameHeight: 38,
      }
    );
    this.#laser.preload();
    this.#battery.preload();
  }
  create() {
    this.#keys = this.scene.input.keyboard!.createCursorKeys();
    this.#sprite = this.#createPlayerSprite();
    this.#laser.create();
    this.#battery.create();
    this.#reloadKey = this.scene.input.keyboard!.addKey("R");
  }
  #createPlayerSprite() {
    const sprite = this.scene.physics.add
      .sprite(10, 200, Spritesheet.PLAYER_IDLE)
      .setScale(2);

    sprite.setMaxVelocity(200, 1000);
    sprite.setDrag(200);

    this.scene.anims.create({
      key: Animation.PLAYER_IDLE,
      frames: this.scene.anims.generateFrameNumbers(
        Spritesheet.PLAYER_IDLE,
        {}
      ),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.anims.create({
      key: Animation.PLAYER_RUN_RIGHT,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.PLAYER_RUN, {}),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: Animation.PLAYER_RUN_LEFT,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.PLAYER_RUN, {
        frames: [5, 4, 3, 2, 1, 0],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: Animation.PLAYER_SHOOT,
      frames: this.scene.anims.generateFrameNumbers(
        Spritesheet.PLAYER_SHOOT,
        {}
      ),
      frameRate: 12,
    });

    this.scene.anims.create({
      key: Animation.PLAYER_RELOADING,
      frames: this.scene.anims.generateFrameNumbers(Spritesheet.PLAYER_SHOOT, {
        frames: [1, 0],
      }),
      frameRate: 12,
    });

    return sprite;
  }
  update() {
    let velocityX = 0;

    const prevState = this.#state;

    if (this.#keys.left.isDown) {
      this.#state = "RUNNING_BACKWARDS";
    } else if (this.#keys.right.isDown) {
      this.#state = "RUNNING";
    } else if (
      this.#keys.space.isDown &&
      (this.#state === "SHOOTING" || this.#state === "RELOADING") &&
      this.#laser.shotsFired === this.#shotsToFire
    ) {
      this.#state = "RELOADING";
    } else if (this.#keys.space.isDown) {
      this.#state = "SHOOTING";
    } else if (Phaser.Input.Keyboard.JustDown(this.#reloadKey)) {
      this.#state = "RELOADING";
    } else if (!this.#keys.space.isDown && this.#state !== "RELOADING") {
      this.#state = "IDLE";
    }

    this.#battery.hide();

    switch (this.#state) {
      case "IDLE": {
        this.#sprite.anims.play(Animation.PLAYER_IDLE, true);
        this.#laser.idle();
        break;
      }
      case "RUNNING_BACKWARDS": {
        velocityX = -Math.min(this.#keys.left.getDuration() / 5, 50);
        this.#sprite.anims.play(Animation.PLAYER_RUN_LEFT, true);
        break;
      }
      case "RUNNING": {
        velocityX = Math.min(this.#keys.right.getDuration() / 5, 100);
        this.#sprite.anims.play(Animation.PLAYER_RUN_RIGHT, true);
        break;
      }
      case "SHOOTING": {
        if (prevState !== "SHOOTING") {
          this.#sprite.anims.play(Animation.PLAYER_SHOOT, false);
        }

        if (this.#laser.shotsFired < this.#shotsToFire) {
          this.#laser.shoot();
        } else {
          this.#laser.idle();
        }

        const isLastShootingFrame =
          this.#sprite.anims.currentFrame?.index === 3;

        if (isLastShootingFrame) {
          this.#battery.show(
            this.#sprite.x,
            this.#sprite.y,
            100 - this.#laser.shotsFired * 20
          );
        }

        break;
      }
      case "RELOADING": {
        if (prevState !== "RELOADING") {
          this.#sprite.anims.play(Animation.PLAYER_RELOADING, false);
          this.scene.time.delayedCall(500, () => {
            this.#laser.reload();
            this.#state = "IDLE";
          });
        }
        this.#laser.idle();

        break;
      }
    }

    this.#sprite.setVelocityX(velocityX);

    if (
      Phaser.Input.Keyboard.JustDown(this.#keys.up) &&
      this.#sprite.body.onFloor()
    ) {
      this.#sprite.body.velocity.y = -100;
    }

    this.#laser.update(this.#sprite.x, this.#sprite.y);
  }
}
