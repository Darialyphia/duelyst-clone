import type { EntityInterceptor } from '../../entity/entity';
import type { inferInterceptor } from '../../utils/helpers';
import type { Keyword } from '../../utils/keywords';
import type { Modifier } from '../modifier';
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
  interceptor: (modifier: Modifier) => inferInterceptor<EntityInterceptor[T]>;
}) => {
  let _interceptor: any;
  return modifierDurationMixin({
    duration,
    keywords,
    tickOn,
    onApplied(session, attachedTo, modifier) {
      _interceptor = interceptor(modifier);
      attachedTo.addInterceptor(key, _interceptor);
    },
    onRemoved(session, attachedTo) {
      attachedTo.removeInterceptor(key, _interceptor);
    }
  });
};
