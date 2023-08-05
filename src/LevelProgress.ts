import * as Phaser from "phaser";
import { EnemyType } from "./types";
import * as colors from "./colors";

type Enemy = { totalCount: number; type: EnemyType; count: number };

export class LevelProgress {
  #container: Phaser.GameObjects.Container;
  #enemies: Enemy[];
  constructor(
    private scene: Phaser.Scene,
    options: {
      enemies: Enemy[];
    }
  ) {
    this.#enemies = options.enemies;
  }
  preload() {
    this.scene.load.image(
      EnemyType.LIZARD,
      "characters/enemies/sprites/lizard/lizard-move1.png"
    );
  }
  create() {
    this.#container = this.scene.add.container();

    this.#enemies.forEach((enemy) => {
      const progress = this.#createProgress(enemy);

      this.#container.add(progress);
    });

    this.#container.setPosition(200, 20);
  }
  #createProgress(enemy: Enemy) {
    const container = this.scene.add.container();

    const lizardImage = this.scene.add
      .image(0, 0, enemy.type)
      .setOrigin(0)
      .setAlpha(0.5);

    const offset = 5;
    const background = this.scene.add
      .rectangle(
        lizardImage.x - offset,
        lizardImage.y - offset,
        lizardImage.displayWidth + offset * 2,
        lizardImage.displayHeight + offset * 2,
        0x000
      )
      .setOrigin(0);

    container.add(background);
    container.add(lizardImage);

    const progressBackground = this.scene.add
      .rectangle(-offset, -offset, background.displayWidth, 0, colors.blue)
      .setAlpha(0.5)
      .setOrigin(0);

    container.add(progressBackground);

    const count = this.scene.add
      .text(
        background.x + background.displayWidth / 2,
        background.y + background.displayHeight / 2,
        String(enemy.count),
        {
          fontSize: "20px",
        }
      )
      .setOrigin(0.5);

    container.add(count);

    const graphics = this.scene.add.graphics();

    graphics.lineStyle(2, colors.blue, 1);

    graphics.strokeRect(
      background.x,
      background.y,
      background.width,
      background.height
    );

    container.add(graphics);

    return container;
  }
  update() {
    this.#container.getAll().forEach((progressContainer, index) => {
      if (!(progressContainer instanceof Phaser.GameObjects.Container)) {
        return;
      }

      const enemy = this.#enemies[index];
      const textObject = progressContainer.getAt(3) as Phaser.GameObjects.Text;

      textObject.setText(String(enemy.count));

      const background = progressContainer.getAt(
        0
      ) as Phaser.GameObjects.Rectangle;
      const progressBackgroundObject = progressContainer.getAt(
        2
      ) as Phaser.GameObjects.Rectangle;

      const currentProgressPercentage =
        (this.#enemies[0].count / this.#enemies[0].totalCount) * 100;

      const progressHeight =
        (background.height / 100) * currentProgressPercentage;

      progressBackgroundObject.height = progressHeight;
      progressBackgroundObject.setY(
        background.y + background.height - progressHeight
      );
    });
  }
  increaseEnemyCount() {
    this.#enemies.forEach((enemy) => {
      enemy.count++;
    });
  }
}
