import type { Nullable } from '@game/shared';
import {
  ExtensionType,
  LoaderParserPriority,
  Spritesheet,
  Texture,
  type ISpritesheetData,
  type Loader
} from 'pixi.js';
import plist from 'plist';

export const PLIST_PARSER = 'plist_parser';

type PlistFrame = {
  frame: string;
  offset: string;
  rotated: boolean;
  sourceColorRect: string;
  sourceSize: string;
};
type PlistSchema = {
  frames: Record<string, PlistFrame>;
  metadata: {
    format: number;
    size: string;
    textureFileName: string;
  };
};

const parsePlistValue = (str: string) => {
  if (!str.startsWith('{')) return str;

  return JSON.parse(str.replaceAll('{', '[').replaceAll('}', ']'));
};

const parsePlist = (url: string, raw: string): ISpritesheetData => {
  const json = plist.parse(raw) as PlistSchema;
  const urlParts = url.split('/');
  const filename = urlParts.at(-1)!.replace('.plist', '');

  const parsedSize = parsePlistValue(json.metadata.size) as [number, number];

  const animations: Record<string, string[]> = {};

  Object.keys(json.frames).forEach(key => {
    const parts = key.replace(`${filename}_`, '').split('_');

    const name = parts.at(-2) ?? 'default'; // spells and artifacts dont have an animation name for their "default" state
    if (!animations[name]) {
      animations[name] = [];
    }
    animations[name].push(key);
  });

  return {
    frames: Object.fromEntries(
      Object.entries(json.frames).map(([key, value]) => {
        const parsedFrame = parsePlistValue(value.frame) as [
          [number, number],
          [number, number]
        ];
        const parsedOffset = parsePlistValue(value.offset) as [number, number];
        const parsedSourceSize = parsePlistValue(value.sourceSize) as [number, number];
        return [
          key,
          {
            frame: {
              x: parsedFrame[0][0] + parsedOffset[0],
              y: parsedFrame[0][1] + parsedOffset[1],
              w: parsedFrame[1][0],
              h: parsedFrame[1][1]
            },
            rotated: value.rotated,
            sourceSize: {
              w: parsedSourceSize[0],
              h: parsedSourceSize[1]
            }
          }
        ];
      })
    ),
    meta: {
      scale: '1',
      image: json.metadata.textureFileName,
      size: { w: parsedSize[0], h: parsedSize[1] }
    },
    animations
  };
};

export const plistParser = {
  extension: {
    name: PLIST_PARSER,
    priority: LoaderParserPriority.Normal,
    type: ExtensionType.LoadParser
  },

  name: PLIST_PARSER,

  async load(url: string) {
    const response = await fetch(url);
    const raw = await response.text();

    return parsePlist(url, raw);
  },

  async testParse(asset: any, options: any): Promise<boolean> {
    return options.src.toLowerCase().endsWith('.plist');
  },

  async parse(asset: ISpritesheetData, options: { src: string }, loader: Loader) {
    const basePath = getDirname(options.src);
    const imagePath = copySearchParams(`${basePath}/${asset.meta.image}`, options.src);
    const texture = await loader.load<Texture>(imagePath);

    const spritesheet = new Spritesheet(texture, asset);
    await spritesheet.parse();

    return spritesheet;
  }
};
