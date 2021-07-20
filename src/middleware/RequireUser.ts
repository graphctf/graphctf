import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function RequireUser(): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isUser) return next();
    throw Error(`Only users can access that property.`);
  });
}

