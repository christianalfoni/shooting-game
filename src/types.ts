export type Texture = {
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
