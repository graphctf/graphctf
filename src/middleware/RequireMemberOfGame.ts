import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function RequireMemberOfGame(argName?: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();

    // Game ID argument
    const gameId = argName ? args[argName]?.id : (root.gameId || root.id);
    if (!gameId) throw Error('Game ID must be provided.');
    if (gameId !== auth.gameId) throw Error('You do not have access to that.');
    return next();
  });
}

