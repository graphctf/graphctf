import 'reflect-metadata';
import { Arg, Mutation } from 'type-graphql';
import { Service } from 'typedi';
import { deserializeLoginToken, login } from '~/context';

@Service()
export class ExchangeTokenResolver {
  @Mutation(() => String)
  async login(
    @Arg('loginToken', () => String) loginToken: string,
    @Arg('code', () => String) code: string,
  ): Promise<string> {
    return login(deserializeLoginToken(loginToken), code);
  }
}
