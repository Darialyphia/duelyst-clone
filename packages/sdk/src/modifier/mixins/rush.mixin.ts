import { KEYWORDS } from '../../utils/keywords';
import type { ModifierMixin } from '../modifier';

export const modifierRushMixin = (): ModifierMixin => ({
  keywords: [KEYWORDS.RUSH],
  onApplied(session, attachedTo) {
    attachedTo.card.addInterceptor('shouldExhaustOnPlay', () => false);
  }
});
