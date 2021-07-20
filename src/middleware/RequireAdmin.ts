import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function RequireAdmin(): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();
    throw Error(`Only admins can access that property.`);
  });
}

