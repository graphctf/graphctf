import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import { FindOneSlugOrIdInput } from '~/inputs/FindOneSlugOrIdInput';

@InputType()
export class TagFilterInput {
  @Field(() => [TagFilterInput], { nullable: true })
  AND?: TagFilterInput[] | undefined

  @Field(() => [TagFilterInput], { nullable: true })
  OR?: TagFilterInput[] | undefined

  @Field(() => FindOneSlugOrIdInput, { nullable: true })
  tag?: FindOneSlugOrIdInput | undefined
}
