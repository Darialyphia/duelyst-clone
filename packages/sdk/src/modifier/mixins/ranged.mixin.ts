import { KEYWORDS } from '../../utils/keywords';
import { modifierInterceptorMixin } from './interceptor.mixin';

export const modifierRangedMixin = () => {
  return modifierInterceptorMixin({
    key: 'range',
    keywords: [KEYWORDS.RANGED],
    duration: Infinity,
    interceptor() {
      return () => Infinity;
    }
  });
};
