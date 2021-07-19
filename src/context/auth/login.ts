import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '~/enums';
import { makeCache } from '~/redis';
import { serializeAuthorizationToken, authTypeFromUserRole } from './AuthorizationToken';
import { AuthorizationTokenResponse } from '~/types';
import { debug } from '~/log';

const loginAuthorizationTokenCache = makeCache('authorization-token');
const loginAuthorizationExpCache = makeCache('authorization-token-exp');

export async function login(username: string, code: string): Promise<AuthorizationTokenResponse> {
  const key = JSON.stringify({ username, code });
  const cachedToken = await loginAuthorizationTokenCache.get(key);
  const cachedExp = await loginAuthorizationExpCache.get(key);
  debug('login', '${username} logged in with code ${code}');

  if (!(cachedToken && cachedExp)) {
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

    const expiresIn = authorizationToken.expiresAt.getSeconds() - (new Date).getSeconds();
    const ttl = Math.floor(expiresIn * 0.75);
    await loginAuthorizationTokenCache.set(key, authorizationToken.token, ttl);
    await loginAuthorizationExpCache.set(key, authorizationToken.expiresAt.getSeconds().toString(), ttl);
    return authorizationToken;
  }

  return {
    token: cachedToken,
    expiresAt: new Date(Number.parseInt(cachedExp) * 1000),
  };
}
