import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

 export function AdminOnlyArg(argName: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();
    if (typeof args[argName] === undefined || args[argName] === null) return next();
    throw Error(`Only admins can specify ${argName}.`);
  });
}

