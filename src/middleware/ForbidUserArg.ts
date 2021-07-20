import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function ForbidUserArg(argName: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (!auth.isUser) return next();
    if (typeof args[argName] === undefined || args[argName] === null) return next();
    throw Error(`Users cannot specify ${argName}.`);
  });
}
