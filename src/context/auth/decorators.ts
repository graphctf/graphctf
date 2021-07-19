import { createMethodDecorator, UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';
import { UserRole } from '~/enums';
import { CheckTeamAccess } from '~/middleware';
import { Context } from '..';

export function RequireUser(): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isUser) return next();
    throw Error(`Only users can access that property.`);
  });
}

export function RequireAdmin(): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();
    throw Error(`Only admins can access that property.`);
  });
}

export function RequireUserOrArg(argName: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isUser) return next();
    if (typeof args[argName] !== undefined && args[argName] !== null) return next();
    throw Error(`${argName} is required for non-users.`);
  });
}

export function ForbidUserArg(argName: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (!auth.isUser) return next();
    if (typeof args[argName] === undefined || args[argName] === null) return next();
    throw Error(`Users cannot specify ${argName}.`);
  });
}

export function AdminOnlyArg(argName: string): MethodAndPropDecorator {
  return UseMiddleware(async ({ args, context: { auth } }, next) => {
    if (auth.isAdmin) return next();
    if (typeof args[argName] === undefined || args[argName] === null) return next();
    throw Error(`Only admins can specify ${argName}.`);
  });
}

export function RequireMemberOfGame(argName?: string): MethodAndPropDecorator {
  // Assumes auth has already been checked.
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    // Admins can access any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const gameId = argName ? args[argName]?.id : (root.gameId || root.id);
    if (!gameId) throw Error('Game ID must be provided.');
    if (gameId !== auth.gameId) throw Error('You do not have access to that game.');
    return next();
  });
}

export function RequireMemberOfTeam(argName?: string): MethodAndPropDecorator {
  // Assumes auth has already been checked.
  return UseMiddleware(async ({ root, args, context: { auth } }, next) => {
    // Admins can edit any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const teamId = argName ? args[argName]?.id : (root.teamId || root.id);
    if (!teamId) throw Error('Team ID must be provided.');
    if (teamId !== auth.teamId) throw Error('You do not have access to that team.');
    return next();
  });
}

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
