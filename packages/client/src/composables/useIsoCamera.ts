import type { InjectionKey } from 'vue';

export type RotationAngle = 0 | 90 | 180 | 270;

export type IsoCameraContext = {
  angle: Ref<RotationAngle>;
  rotateCW(): void;
  rotateCCW(): void;
};
const ISOCAMERA_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<IsoCameraContext>;

export const useIsoCameraProvider = () => {
  const api: IsoCameraContext = {
    angle: ref(0),
    rotateCW() {
      api.angle.value = ((api.angle.value + 360 + 90) % 360) as RotationAngle;
    },
    rotateCCW() {
      api.angle.value = ((api.angle.value + 360 - 90) % 360) as RotationAngle;
    }
  };

  provide(ISOCAMERA_INJECTION_KEY, api);

  return api;
};

export const useIsoCamera = () => useSafeInject(ISOCAMERA_INJECTION_KEY);
