import type { EntityInterceptor } from '../../entity/entity';
import type { inferInterceptor } from '../../utils/helpers';
import type { Keyword } from '../../utils/keywords';
import { modifierDurationMixin } from './duration.mixin';

export const modifierInterceptorMixin = <T extends keyof EntityInterceptor>({
  key,
  duration,
  interceptor,
  tickOn,
  keywords
}: {
  key: T;
  keywords: Keyword[];
  duration: number;
  tickOn?: Parameters<typeof modifierDurationMixin>[0]['tickOn'];
  interceptor: inferInterceptor<EntityInterceptor[T]>;
}) => {
  return modifierDurationMixin({
    duration,
    keywords,
    tickOn,
    onApplied(session, attachedTo) {
      attachedTo.addInterceptor(key, interceptor);
    },
    onRemoved(session, attachedTo) {
      attachedTo.removeInterceptor(key, interceptor);
    }
  });
};
