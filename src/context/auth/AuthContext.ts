import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../enums';
import config from '../../config';
import { makeCache } from '../../redis';
import { JwtToken } from './JwtToken';
import { User } from '../../types';

const prisma = new PrismaClient();
const userTokenCache = makeCache('userToken');
const userTeamCache = makeCache('userTeam');

export class AuthContext {
  private token?: JwtToken | undefined;

  private tokenString?: string | undefined;

  constructor(token?: string | undefined) {
    if (!token) return;
    this.tokenString = token;

    this.token = <JwtToken> verify(token, config.session.secret, { audience: config.session.audience });
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

  public get isAdmin(): boolean {
    return this.token?.adm || false;
  }

  public get username(): string | null {
    return this.token?.sub || null;
  }

  public get teamSlug(): string | null {
    return this.token?.tea || null;
  }

  public get gameId(): string | null {
    return this.token?.gam || null;
  }

  public get role(): UserRole | null {
    return this.token?.rol || null;
  }

  private user?: User | null | undefined;

  async getUser(): Promise<User> {
    if (!this.isUser) throw new Error(`This resource requires authentication.`);
    if (!this.user) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.user = await User.fromUsernameAndGameId(this.token!.sub!, this.token!.gam!);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.user!;
  }

  private async updateDb(): Promise<void> {
    if (!this.isUser) return;
    if (!this.token || !this.token.sub || !this.token.tea || !this.token.gam) return;
    if (!this.tokenString || await userTokenCache.get(this.token.sub) === this.tokenString) return; // no change
    await userTokenCache.set(this.token.sub, this.tokenString);

    // Check if the user's team is changing
    const user = await User.fromUsernameAndGameId(this.token.sub, this.token.gam, {});
    if (user?.teamId !== this.token.tea) {
      await user?.changeTeam(this.token.tea);
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
    this.user = new User(await prisma.user.upsert({
      where: { username_gameId: { username: this.token.sub, gameId: this.token.gam } },
      update: { role: this.token.rol },
      create: {
        username: this.token.sub,
        game: { connect: { id: this.token.gam } },
        role: this.token.rol || UserRole.USER,
        team,
      },
    }));
    await userTeamCache.set(this.token.sub, this.token.tea);
  }
}
