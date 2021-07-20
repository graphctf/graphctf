import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';
import { UserRole } from '~/enums';

export function RequireCaptainOfTeam(argName?: string): MethodAndPropDecorator {
  // Assumes auth has already been checked.
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    // Admins can edit any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const teamId = argName ? args[argName]?.id : (root.teamId || root.id);
    if (!teamId) throw Error('Team ID must be provided.');
    if (teamId !== auth.teamId) throw Error('You do not have access to that team.');
    if (auth.role !== UserRole.CAPTAIN) throw Error('You are not a captain of that team.');
    return next();
  });
}
