import type { AnyCard, Cell, Entity, EntityId, GameSession } from '@game/sdk';
import { Unit } from '@game/sdk/src/card/unit';
import { type Nullable, type Point3D, type Values } from '@game/shared';
import type { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import type { InjectionKey } from 'vue';

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

  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref()
  };

  const api: GameUiContext = {
    targetingMode,
    followupTargets,
    selectedCardIndex,
    switchTargetingMode(mode) {
      targetingMode.value = mode;
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
      if (api.selectedCard.value instanceof Unit) {
        api.switchTargetingMode(TARGETING_MODES.SUMMON);
      }
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
