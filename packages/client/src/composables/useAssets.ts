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

const splitBundle = (manifest: AssetsManifest, name: string) => {
  const bundle = manifest.bundles.find(b => b.name === name)!;
  manifest.bundles.splice(manifest.bundles.indexOf(bundle), 1);
  (bundle.assets as UnresolvedAsset[]).forEach(asset => {
    manifest.bundles.push({
      name: asset.alias?.[0] ?? '',
      assets: [asset]
    });
  });
};

export const useAssetsProvider = () => {
  const loaded = ref(false);
  const load = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser, plistParser);

    Assets.cache.reset();
    const manifest = await $fetch<AssetsManifest>('/assets/assets-manifest.json');

    // transform the manifest to add separate bundles for units and icons, as loading everything at once is way too expensive
    splitBundle(manifest, 'units');
    splitBundle(manifest, 'icons');

    Assets.init({ manifest });

    await Promise.all([
      Assets.loadBundle('tiles'),
      Assets.loadBundle('ui'),
      // Assets.loadBundle('units'),
      Assets.loadBundle('tilesets'),
      Assets.loadBundle('interactables'),
      Assets.loadBundle('hitboxes'),
      Assets.loadBundle('modifiers')
    ]);
    loaded.value = true;
  };

  const bundlesLoaded = new Set<string>();
  const api: AssetsContext = {
    loaded,
    load,
    async loadSpritesheet(key) {
      // avoids pixi warning messages when wetry to load a bundle multiple times
      if (!bundlesLoaded.has(key)) {
        await Assets.loadBundle(key);
        bundlesLoaded.add(key);
      }
      return Assets.get<SpritesheetWithAnimations>(key);
    },
    getSpritesheet(key: string) {
      const sheet = Assets.get<SpritesheetWithAnimations>(key);
      if (!sheet) {
        throw new Error(`Spritesheet not found for ${key}`);
      }
      return sheet;
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
