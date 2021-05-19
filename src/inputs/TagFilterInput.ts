import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import { FindOneSlugOrIdInput } from './FindOneSlugOrIdInput';

@InputType()
export class TagFilterInput {
  @Field(() => [TagFilterInput], { nullable: true })
  AND?: TagFilterInput[] | undefined

  @Field(() => [TagFilterInput], { nullable: true })
  OR?: TagFilterInput[] | undefined

  @Field(() => FindOneSlugOrIdInput, { nullable: true })
  tag?: FindOneSlugOrIdInput | undefined

  toQuery(): Prisma.TagWhereInput {
    return {
      AND: this.AND,
      OR: this.OR,
      ...this.tag?.toQuery(),
    };
  }
}
