import { ENTITY_EVENTS } from '../../entity/entity';
import { KEYWORDS, type Keyword } from '../../utils/keywords';
import type { Modifier, ModifierMixin } from '../modifier';

export const modifierOpeningGambitMixin = ({
  keywords = [],
  handler
}: {
  handler: Modifier['onApplied'];
  keywords?: Keyword[];
}): ModifierMixin => {
  return {
    keywords: [...keywords, KEYWORDS.OPENING_GAMBIT],
    onApplied(session, attachedTo, modifier) {
      const listener = async () => {
        await handler(session, attachedTo, modifier);
        attachedTo.off(ENTITY_EVENTS.CREATED, listener);
      };
      attachedTo.on(ENTITY_EVENTS.CREATED, listener);
    }
  };
};
