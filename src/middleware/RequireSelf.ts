import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function RequireSelf(argName?: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();

    const userId = argName ? args[argName]?.id : (root.userId || root.id);
    if (!userId) throw Error('User ID must be provided.');
    if (userId !== auth.userId) throw Error('You do not have access to that.');
    return next();
  });
}
