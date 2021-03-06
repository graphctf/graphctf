import { sign, verify } from 'jsonwebtoken';
import { DateTime } from 'luxon';
import config from '~/config';
import { UserRole } from '~/enums';
import { AuthorizationTokenResponse } from '~/types';
import { debug } from '~/log';

export enum AuthType {
  ADMIN = 'a',
  CAPTAIN = 'c',
  USER = 'u',
}

export function authTypeFromUserRole(role: UserRole): AuthType {
  return {
    [UserRole.CAPTAIN]: AuthType.CAPTAIN,
    [UserRole.USER]: AuthType.USER,
  }[role];
}

export function userRoleFromAuthType(typ: AuthType): UserRole | null {
  return {
    [AuthType.ADMIN]: null,
    [AuthType.CAPTAIN]: UserRole.CAPTAIN,
    [AuthType.USER]: UserRole.USER,
  }[typ];
}

export interface AuthorizationToken {
  /* Token type: admin (create/populate games) or team member (solve challenges) */
  typ: AuthType

  /* User ID, if typ is not admin. */
  sub?: string

  /* Team ID, if typ is not admin. */
  tea?: string

  /* Game ID, if typ is not admin */
  gam?: string
}

function validateToken(token: Partial<AuthorizationToken>): asserts token is AuthorizationToken {
  const {
    typ, sub, tea, gam,
  } = token;
  if (!typ) throw Error('Type is required.');
  if (typ === AuthType.ADMIN && (sub || tea || gam)) throw Error('sub/tea/gam cannot be set on admin tokens.');
  if (typ !== AuthType.ADMIN && (!sub || !tea || !gam)) throw Error('sub/tea/gam must be set on non-admin tokens.');
}

export function deserializeAuthorizationToken(tokenStr: string): AuthorizationToken {
  const token = <Partial<AuthorizationToken>>verify(
    tokenStr,
    config.token.session.secret,
    { audience: config.token.session.audience },
  );
  validateToken(token);
  return token;
}

export function serializeAuthorizationToken(token: AuthorizationToken): AuthorizationTokenResponse {
  validateToken(token);
  const expires = DateTime.local().plus({ days: 5 });
  const tokenStr = sign(
    { ...token, exp: expires.toSeconds() },
    config.token.session.secret,
    { audience: config.token.session.audience }
  );

  debug('login', `Minted typ=${token.typ} token for uid=${token.sub}, gid=${token.gam}, tid=${token.tea}`);

  return {
    token: tokenStr,
    expiresAt: expires.toJSDate(),
  };
}
