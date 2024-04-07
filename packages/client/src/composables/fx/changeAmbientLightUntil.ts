import type { FxCommand } from '../useFx';

export const changeAmbientLightUntil: FxCommand<'changeAmbientLightUntil'> = (
  { ui, done },
  color,
  strength
) => {
  ui.setAmbientLightColor(color);
  ui.setAmbientLightStrength(strength);
  return () => {
    ui.setAmbientLightColor(DEFAULT_AMBIENT_LIGHT_COLOR);
    ui.setAmbientLightStrength(DEFAULT_AMBIENT_LIGHT_STRENGTH);
    done();
  };
};
