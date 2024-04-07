import type { AnyCard, Cell, Entity, EntityId, GameSession } from '@game/sdk';
import { type Nullable, type Point, type Point3D, type Values } from '@game/shared';
import type { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import type { InjectionKey } from 'vue';

export const DEFAULT_MOUSE_LIGHT_STRENGTH = 16;
export const DEFAULT_MOUSE_LIGHT_COLOR = '#ffffff';

export const TARGETING_MODES = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  SUMMON: 'SUMMON',
  FOLLOWUP: 'CARD_FOLLOWUP'
} as const;

type TargetingMode = Values<typeof TARGETING_MODES>;
type LayerName = 'ui' | 'scene';

export type GameUiContext = {
  targetingMode: Ref<TargetingMode>;

  mousePosition: Ref<Point>;
  mouseLightColor: Ref<number | string>;
  setMouseLightColor(val: number | string): void;
  mouseLightStrength: Ref<number>;
  setMouseLightStrength(val: number): void;

  hoveredCell: ComputedRef<Nullable<Cell>>;
  hoveredEntity: ComputedRef<Nullable<Entity>>;
  hoverAt(point: Point3D): void;
  unhover(): void;

  selectedEntity: ComputedRef<Nullable<Entity>>;
  selectEntity(entityId: EntityId): void;
  unselectEntity(): void;

  selectedCard: ComputedRef<Nullable<AnyCard>>;
  selectedCardIndex: Ref<Nullable<number>>;
  followupTargets: Ref<Point3D[]>;
  summonTarget: Ref<Nullable<Point3D>>;
  selectCardAtIndex(index: number): void;
  unselectCard(): void;

  switchTargetingMode(mode: TargetingMode): void;

  registerLayer(layer: Layer, name: LayerName): void;
  assignLayer(obj: Nullable<DisplayObject>, layer: LayerName): void;
};

const GAME_UI_INJECTION_KEY = Symbol('game-ui') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const hoveredPosition = ref<Nullable<Point3D>>(null);
  const selectedCardIndex = ref<Nullable<number>>(null);
  const selectedEntityId = ref<Nullable<EntityId>>(null);
  const followupTargets = ref<Point3D[]>([]);
  const summonTarget = ref<Nullable<Point3D>>();

  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref()
  };

  const api: GameUiContext = {
    targetingMode,
    summonTarget,
    followupTargets,
    selectedCardIndex,
    mousePosition: ref({ x: 0, y: 0 }),
    mouseLightColor: ref(DEFAULT_MOUSE_LIGHT_COLOR),
    setMouseLightColor(val) {
      gsap.to(api.mouseLightColor, {
        value: val,
        duration: 0.5,
        ease: Power2.easeOut
      });
    },
    mouseLightStrength: ref(DEFAULT_MOUSE_LIGHT_STRENGTH),
    setMouseLightStrength(val) {
      gsap.to(api.mouseLightStrength, {
        value: val,
        duration: 0.5,
        ease: Power2.easeOut
      });
    },
    switchTargetingMode(mode) {
      targetingMode.value = mode;
      api.mouseLightColor.value = DEFAULT_MOUSE_LIGHT_COLOR;
    },
    registerLayer(layer, name) {
      if (!layer) return;
      layers[name].value = layer;
      layer.group.enableSort = true;
      layer.sortableChildren = true;
    },
    assignLayer(obj, name) {
      if (!isDefined(obj)) return;
      obj.parentLayer = layers[name].value;
    },
    hoveredEntity: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.entitySystem.getEntityAt(hoveredPosition.value);
    }),
    hoveredCell: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.boardSystem.getCellAt(hoveredPosition.value);
    }),
    hoverAt(point) {
      hoveredPosition.value = point;
    },
    unhover() {
      hoveredPosition.value = null;
    },
    selectedEntity: computed(() => {
      if (!selectedEntityId.value) return null;
      return session.entitySystem.getEntityById(selectedEntityId.value);
    }),
    selectEntity(entityId) {
      selectedEntityId.value = entityId;
      api.switchTargetingMode(TARGETING_MODES.BASIC);
      selectedCardIndex.value = null;
    },
    unselectEntity() {
      selectedEntityId.value = null;
      api.switchTargetingMode(TARGETING_MODES.NONE);
    },
    selectedCard: computed(() => {
      if (!isDefined(selectedCardIndex.value)) return null;
      return session.playerSystem.activePlayer.getCardFromHand(selectedCardIndex.value);
    }),
    selectCardAtIndex(index) {
      selectedCardIndex.value = index;
      api.switchTargetingMode(TARGETING_MODES.SUMMON);
      selectedEntityId.value = null;
    },
    unselectCard() {
      selectedCardIndex.value = null;
      followupTargets.value = [];
      api.switchTargetingMode(TARGETING_MODES.NONE);
    }
  };
  provide(GAME_UI_INJECTION_KEY, api);

  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
