import 'reflect-metadata';
import config from '../config';
import {Arg, Mutation} from "type-graphql";
import {JwtToken} from '../context';
import {Service} from "typedi";
import {sign, verify} from 'jsonwebtoken';

@Service()
export class ExchangeTokenResolver
{
  @Mutation(() => String)
  exchange(
    @Arg('token', () => String) rawToken: string
  ): string
  {
    //Verify and parse the exchange token
    const exchangeToken = verify(rawToken, config.exchange.secret, { audience: config.exchange.audience }) as any;

    //Extract data
    const code = exchangeToken.code;
    const username = exchangeToken.username;

    //Validate data
    if (code == null || code.length < 1 || code.length > 100)
    {
      throw new Error('Property "code" must be defined and be 1-100 characters long!');
    }

    if (username == null)
    {
      throw new Error('Property "username" must be defined!');
    }

    //TODO: Check if the user should be an admin
    const admin = false;

    //TODO: Get the team slug by the join code
    const team = '';

    //TODO: Get the user's role
    const role = 'USER';

    //Create and sign the session token
    const sessionToken = sign({
      adm: admin,
      gam: config.game.id,
      tea: team,
      sub: username,
      rol: role
    } as JwtToken, config.session.secret, {
      algorithm: 'HS512',
      audience: config.session.audience
    });

    return sessionToken;
  }
}