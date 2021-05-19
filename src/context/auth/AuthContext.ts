import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../enums';
import config from '../../config';
import { makeCache } from '../../redis';
import { JwtToken } from './JwtToken';

const userTokenCache = makeCache('userToken');
const userTeamCache = makeCache('userTeam');

export class AuthContext {
  private token?: JwtToken | undefined;

  private tokenString?: string | undefined;

  constructor(token?: string | undefined) {
    if (!token) return;
    this.tokenString = token;

    this.token = <JwtToken> verify(token, config.auth.secret, { audience: config.auth.audience });
    if (this.token?.sub) {
      if (!(this.token.tea || this.token.gam)) {
        throw Error(`User token requires game and team information.`);
      }
      this.updateDb();
    } else if (!this.token?.adm) throw new Error(`Token is missing a user.`);
  }

  public get isAuthenticated(): boolean {
    return typeof this.token !== 'undefined';
  }

  public get isUser(): boolean {
    return Boolean(this.token && this.token.sub && this.token.gam);
  }

  private async updateDb(): Promise<void> {
    if (!this.isUser) return;
    if (!this.token || !this.token.sub || !this.token.tea || !this.token.gam) return;
    if (!this.tokenString || await userTokenCache.get(this.token.sub) === this.tokenString) return; // no change
    await userTokenCache.set(this.token.sub, this.tokenString);

    const prisma = new PrismaClient();

    // Check if the team is changing
    let prevUserTeam = await userTeamCache.get(this.token.sub);
    if (!prevUserTeam) {
      prevUserTeam = (await prisma.user.findUnique({
        select: { teamId: true },
        where: { username_gameId: { username: this.token.sub, gameId: this.token.gam } },
      }))?.teamId || null;
    }

    // TODO(@tylermenezes): Move some of this logic into the User class.
    if (prevUserTeam && prevUserTeam !== this.token.tea) {
      // The user's team has changed, so we'll delete everything related to their old team.
      const where = { user: { username: this.token.sub }, team: { id: prevUserTeam } };
      // eslint-disable-next-line no-underscore-dangle
      const previousPoints = (await prisma.attempt.aggregate({ _sum: { pointsEarned: true }, where }))
        ._sum.pointsEarned || 0;
      // eslint-disable-next-line no-underscore-dangle
      const previousPenalties = (await prisma.hintReveal.aggregate({ _sum: { pointsCost: true }, where }))
        ._sum.pointsCost || 0;
      await prisma.team.update({
        where: { id: prevUserTeam },
        data: { points: { increment: previousPenalties - previousPoints } },
      });
      await prisma.attempt.deleteMany({ where });
      await prisma.hintReveal.deleteMany({ where });
    }

    const team = {
      connectOrCreate: {
        where: { slug_gameId: { slug: this.token.tea, gameId: this.token.gam } },
        create: {
          slug: this.token.tea,
          name: this.token.tea,
          game: { connect: { id: this.token.gam } },
        },
      },
    };
    await prisma.user.upsert({
      where: { username_gameId: { username: this.token.sub, gameId: this.token.gam } },
      update: { team },
      create: {
        username: this.token.sub,
        game: { connect: { id: this.token.gam } },
        role: this.token.rol || UserRole.USER,
        team,
      },
    });
    await userTeamCache.set(this.token.sub, this.token.tea);
  }
}
