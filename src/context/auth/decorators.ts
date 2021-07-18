import { createMethodDecorator } from 'type-graphql';
import { UserRole } from '~/enums';
import { Context } from '..';

export function RequireUser(): MethodDecorator {
  return createMethodDecorator<Context>(async ({ args, context: { auth } }, next) => {
    if (auth.isUser) return next();
    throw Error(`You must be a user to perform that action.`);
  });
}

export function RequireUserOrArg(argName: string): MethodDecorator {
  return createMethodDecorator<Context>(async ({ args, context: { auth } }, next) => {
    if (auth.isUser) return next();
    if (typeof args[argName] !== undefined && args[argName] !== null) return next();
    throw Error(`${argName} is required for non-users.`);
  });
}

export function ForbidUserSpecification(argName: string): MethodDecorator {
  return createMethodDecorator<Context>(async ({ args, context: { auth } }, next) => {
    if (!auth.isUser) return next();
    if (typeof args[argName] === undefined || args[argName] === null) return next();
    throw Error(`Users cannot specify ${argName}.`);
  });
}

export function MemberOfGame(argName: string): MethodDecorator {
  // Assumes auth has already been checked.
  return createMethodDecorator<Context>(async ({ context: { auth }, args }, next) => {
    // Admins can edit any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const gameId = args[argName]?.id;
    if (!gameId) throw Error('Game ID must be provided.');
    if (gameId !== auth.gameId) throw Error('You do not have access to that game.');
    return next();
  });
}

export function MemberOfTeam(argName: string): MethodDecorator {
  // Assumes auth has already been checked.
  return createMethodDecorator<Context>(async ({ context: { auth }, args }, next) => {
    // Admins can edit any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const teamId = args[argName]?.id;
    if (!teamId) throw Error('Team ID must be provided.');
    if (teamId !== auth.teamId) throw Error('You do not have access to that team.');
    return next();
  });
}

export function CaptainOfTeam(argName: string): MethodDecorator {
  // Assumes auth has already been checked.
  return createMethodDecorator<Context>(async ({ context: { auth }, args }, next) => {
    // Admins can edit any game
    if (auth.isAdmin) return next();

    // Team ID argument
    const teamId = args[argName]?.id;
    if (!teamId) throw Error('Team ID must be provided.');
    if (teamId !== auth.teamId) throw Error('You do not have access to that team.');
    if (auth.role !== UserRole.CAPTAIN) throw Error('You are not a captain of that team.');
    return next();
  });
}
