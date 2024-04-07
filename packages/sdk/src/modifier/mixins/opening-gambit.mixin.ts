import { ENTITY_EVENTS } from '../../entity/entity';
import { KEYWORDS, type Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';

export const modifierOpeningGambitMixin = ({
  keywords = [],
  handler
}: {
  handler: EntityModifier['onApplied'];
  keywords?: Keyword[];
}): EntityModifierMixin => {
  return {
    keywords: [...keywords, KEYWORDS.OPENING_GAMBIT],
    onApplied(session, entity, modifier) {
      entity.once(ENTITY_EVENTS.CREATED, async () => {
        await handler(session, entity, modifier);
      });
    }
  };
};
