import { Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { User } from '~/types';

@Service()
@Resolver(() => User)
export class ParticipantUserResolver {

}
