import { KEYWORDS } from '../../utils/keywords';
import type { EntityModifierMixin } from '../entity-modifier';

export const modifierRushMixin = (): EntityModifierMixin => ({
  keywords: [KEYWORDS.RUSH],
  onApplied(session, attachedTo) {
    attachedTo.card.addInterceptor('shouldExhaustOnPlay', () => false);
  },
  onRemoved(session, attachedTo, modifier) {
    attachedTo.exhaust();
  }
});
