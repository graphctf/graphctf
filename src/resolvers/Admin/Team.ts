import { Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { Team } from '~/types';

@Service()
@Resolver(() => Team)
export class TeamResolver {

}
