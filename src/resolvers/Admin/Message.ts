import { Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { Message } from '~/types';

@Service()
@Resolver(() => Message)
export class MessageResolver {

}
