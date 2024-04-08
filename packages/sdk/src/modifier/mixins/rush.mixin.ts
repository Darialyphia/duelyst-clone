import type { Unit } from '../../card/unit';
import { KEYWORDS } from '../../utils/keywords';
import type { EntityModifierMixin } from '../entity-modifier';

export const modifierRushMixin = (): EntityModifierMixin => ({
  keywords: [KEYWORDS.RUSH],
  onApplied(session, entity) {
    (entity.card as Unit).addInterceptor('shouldExhaustOnPlay', () => false);
  },
  onRemoved(session, entity) {
    entity.exhaust();
  }
});
