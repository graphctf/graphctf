import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../enums';
import { makeCache } from '../../redis';
import { serializeAuthorizationToken, authTypeFromUserRole } from './AuthorizationToken';

const loginAuthorizationTokenCache = makeCache('authorization-token');

export async function login(username: string, code: string): Promise<string> {
  const key = JSON.stringify({ username, code });
  if (!await loginAuthorizationTokenCache.has(key)) {
    const prisma = Container.get(PrismaClient);
    const team = await prisma.team.findUnique({
      where: { code },
      select: { id: true, gameId: true, users: { take: 1, select: { id: true } } },
    });
    if (!team) throw Error('Incorrect code.');
    const { id: teamId, gameId, users } = team;
    const role = users.length > 0 ? UserRole.USER : UserRole.CAPTAIN;

    const { id: userId, role: userRole } = await prisma.user.upsert({
      where: { username_gameId: { username, gameId } },
      create: {
        username,
        role,
        game: { connect: { id: gameId } },
        team: { connect: { id: teamId } },
      },
      update: {},
      select: { id: true, role: true },
    });

    const authorizationToken = serializeAuthorizationToken({
      typ: authTypeFromUserRole(userRole),
      sub: userId,
      tea: teamId,
      gam: gameId,
    });
    await loginAuthorizationTokenCache.set(key, authorizationToken);
    return authorizationToken;
  }

  return <string><unknown>loginAuthorizationTokenCache.get(key);
}
