import {
  Assets,
  type AssetsManifest,
  Spritesheet,
  Texture,
  type UnresolvedAsset,
  extensions
} from 'pixi.js';
import type { InjectionKey } from 'vue';

export type SpritesheetWithAnimations = Spritesheet & {
  animations: Record<string, Texture[]>;
};
export type AssetsContext = {
  loaded: Ref<boolean>;
  loadSpritesheet(key: string): Promise<SpritesheetWithAnimations>;
  getSpritesheet(key: string): SpritesheetWithAnimations;
  getTexture(key: string): Texture;
  getHitbox(key: string): any;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  const loaded = ref(false);
  const load = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser, plistParser);

    Assets.cache.reset();
    const manifest = await $fetch<AssetsManifest>('/assets/assets-manifest.json');
    // transform the manifest to add one bundle pr unit, as loading everything at once is way too expensive

    const unitsBundle = manifest.bundles.find(b => b.name === 'units')!;
    manifest.bundles.splice(manifest.bundles.indexOf(unitsBundle), 1);
    (unitsBundle.assets as UnresolvedAsset[]).forEach(asset => {
      manifest.bundles.push({
        name: asset.alias?.[0] ?? '',
        assets: [asset]
      });
    });

    Assets.init({ manifest });

    await Promise.all([
      Assets.loadBundle('tiles'),
      Assets.loadBundle('ui'),
      // Assets.loadBundle('units'),
      Assets.loadBundle('tilesets'),
      Assets.loadBundle('interactables'),
      Assets.loadBundle('fx'),
      Assets.loadBundle('hitboxes'),
      Assets.loadBundle('modifiers')
    ]);
    loaded.value = true;
  };

  const unitsBundlesLoaded = new Set<string>();
  const api: AssetsContext = {
    loaded,
    load,
    async loadSpritesheet(key) {
      // avoids pixi warning messages when wetry to load a bundle multiple times
      if (!unitsBundlesLoaded.has(key)) {
        await Assets.loadBundle(key);
        unitsBundlesLoaded.add(key);
      }
      return Assets.get<SpritesheetWithAnimations>(key);
    },
    getSpritesheet(key: string) {
      return Assets.get<SpritesheetWithAnimations>(key);
    },
    getTexture(key: string) {
      return Assets.get<Texture>(key);
    },
    getHitbox(key) {
      return Assets.get<any>(`hitbox-${key}`);
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
