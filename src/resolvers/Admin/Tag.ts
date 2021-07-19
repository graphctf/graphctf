import { Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { Tag } from '~/types';

@Service()
@Resolver(() => Tag)
export class AdminTagResolver {

}
