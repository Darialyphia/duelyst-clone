import type { FrameObject, Spritesheet } from 'pixi.js';

// matches textures from an animation to its duration in the sprite sheet data
export const createSpritesheetFrameObject = (
  name: string,
  spritesheet: Spritesheet
): FrameObject[] => {
  const frames = spritesheet.data.animations?.[name];
  const textures = spritesheet.animations[name];
  if (!frames || !textures) throw new Error(`unknown animation: ${name}`);

  const defaultDuration = isHalfSpeed(spritesheet, name) ? 160 : 80;
  return frames.map((frame, index) => {
    return {
      texture: textures[index],
      // @ts-ignore bruh
      time: spritesheet.data.frames[frame].duration ?? defaultDuration
    };
  });
};

export const SPRITE_ZINDEX_OFFSETS = {
  INTERACTABLE: 2,
  HOVERED_CELL: 1.5,
  ENTITY: 2.1,
  HALF_TILE: -1
} as const;

// some sprites animations needs to be played at half speed, but it's not indicated in the plist filename
// so we have to manually do the bookkeeping here as we'll add the sprites :pepehands:
// maybe I should make an fx.ts file like CPG, after all it was only EIGHTEEN THOUSAND LINES
// also cannot wait to find out there are other speeds somewhere in this file
export const HALF_SPEED_SPRITES: [string, string][] = [
  ['icon_f4_voidpulse.png', 'default'],
  ['icon_f4_d2_daemoniclure.png', 'default']
];

export const isHalfSpeed = (sheet: Spritesheet, animation: string) => {
  return HALF_SPEED_SPRITES.some(
    ([name, animationName]) =>
      sheet.data.meta.image === name && animationName === animation
  );
};
