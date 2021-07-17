import { UserRole } from '~/enums';
import {
  AuthorizationToken, AuthType, userRoleFromAuthType, deserializeAuthorizationToken,
} from './AuthorizationToken';

export interface AuthContextUser { userId: string, teamId: string, gameId: string, role: UserRole }
export interface AuthContextAdmin { userId: null, teamId: null, gameId: null, role: null }

export class AuthContext {
  private token?: AuthorizationToken | undefined;

  constructor(token?: string | undefined) {
    if (!token) return;
    this.token = deserializeAuthorizationToken(token);
  }

  public requireUser(): asserts this is AuthContextUser {
    if (!this.isUser) throw Error(`You must be a user.`);
  }

  public requireAdmin(): asserts this is AuthContextAdmin {
    if (!this.isAdmin) throw Error(`You must be an admin.`);
  }

  public get isAuthenticated(): boolean {
    return typeof this.token !== 'undefined';
  }

  public get isUser(): boolean {
    return Boolean(this.token?.sub);
  }

  public get isAdmin(): boolean {
    return this.token?.typ === AuthType.ADMIN || false;
  }

  public get role(): UserRole | null {
    return this.token?.typ ? userRoleFromAuthType(this.token.typ) : null;
  }

  public get userId(): string | null {
    return this.token?.sub || null;
  }

  public get teamId(): string | null {
    return this.token?.tea || null;
  }

  public get gameId(): string | null {
    return this.token?.gam || null;
  }
}
