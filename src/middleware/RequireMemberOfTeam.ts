import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';

export function RequireMemberOfTeam(argName?: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();

    // Team ID argument
    const teamId = argName ? args[argName]?.id : (root.teamId || root.id);
    if (!teamId) throw Error('Team ID must be provided.');
    if (teamId !== auth.teamId) throw Error('You do not have access to that.');
    return next();
  });
}
