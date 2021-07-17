import { verify } from 'jsonwebtoken';
import config from '../../config';

export type LoginToken = { username: string, nickname?: string } | { username?: string, nickname: string }

function validateToken(token: Partial<LoginToken>): asserts token is LoginToken {
  if (!(token.username || token.nickname)) throw Error('Username is required in login tokens.');
}

export function deserializeLoginToken(tokenStr: string): string {
  const token = <Partial<LoginToken>>verify(
    tokenStr,
    config.token.login.secret,
    { audience: config.token.login.audience },
  );
  validateToken(token);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (token.username || token.nickname)!;
}
