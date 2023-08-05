export enum EnemyType {
  LIZARD = "LIZARD",
}

export type TextureData = {
  name: string;
  file: string;
};

export type StaticSprites = Record<
  number,
  Phaser.Types.Physics.Arcade.SpriteWithStaticBody
>;

export type Sprites = Record<
  number,
  Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
>;
