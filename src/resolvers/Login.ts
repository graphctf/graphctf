import { Arg, Mutation } from 'type-graphql';
import { Service } from 'typedi';
import { AuthType, deserializeLoginToken, login, serializeAuthorizationToken } from '~/context';
import config from '~/config';
import { AuthorizationTokenResponse } from '~/types';

@Service()
export class ExchangeTokenResolver {
  @Mutation(() => AuthorizationTokenResponse)
  async login(
    @Arg('loginToken', () => String) loginToken: string,
    @Arg('code', () => String) code: string,
  ): Promise<AuthorizationTokenResponse> {
    return login(deserializeLoginToken(loginToken), code);
  }

  @Mutation(() => AuthorizationTokenResponse)
  async adminLogin(
    @Arg('password', () => String) password: string,
  ): Promise<AuthorizationTokenResponse> {
    // TODO(@tylermenezes): Rate limiting
    if (password === config.adminPassword) {
      return serializeAuthorizationToken({ typ: AuthType.ADMIN });
    } else {
      throw Error('Incorrect password.');
    }
  }
}
