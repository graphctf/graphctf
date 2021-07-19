import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';
import { warn } from '~/log';

export function RequireVisible(fallback: any, methodName?: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ root, context }, next) => {
    const { auth } = context;
    const visibleProp = methodName || 'isVisible';
    if (auth.isAdmin) return next();
    if (!(visibleProp in root)) warn('middleware', `No method named ${visibleProp} in object, defaulting to error.`);
    if (!(visibleProp in root) || !root[visibleProp](context)) {
      if (typeof fallback !== 'undefined') return fallback;
      throw Error('Challenge is not visible.');
    }
    return next();
  });
}
