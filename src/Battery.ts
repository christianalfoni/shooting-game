import * as Phaser from "phaser";

export class Battery {
  #sprite: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  #text: Phaser.GameObjects.Text;
  constructor(private scene: Phaser.Scene) {}
  preload() {
    this.scene.load.image("battery", "characters/player/sprites/battery.png");
  }
  create() {
    this.#sprite = this.scene.physics.add
      .staticSprite(0, 0, "battery")
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0, 0)
      .setScale(2);

    this.#text = this.scene.add
      .text(0, 0, "100%", {
        fontFamily: "monospace",
        color: "#4999bb",
        fontSize: "12px",
        align: "right",
      })
      .setAlpha(0.6)
      .setVisible(false)
      .setOrigin(0, 0);
  }
  update() {}
  hide() {
    this.#sprite.setVisible(false);
    this.#text.setVisible(false);
  }
  show(x: number, y: number, percentage: number) {
    this.#sprite
      .setVisible(true)
      .setPosition(x + 20, y - 22)
      .setAngle(0);
    this.#text
      .setText(`${percentage}%`)
      .setVisible(true)
      .setPosition(x + 20, y - 36)
      .setAngle(0);
  }
}
