import { InputType, Field } from 'type-graphql';
import { IIF } from '~/validators';

export type FindOneSlugOrIdInputQuery = { id: string } | { slug: string };

@InputType()
export class FindOneSlugOrIdInput {
  @Field(() => String, { nullable: true })
  @IIF((self: FindOneSlugOrIdInput) => !self.slug)
  id?: string | undefined;

  @Field(() => String, { nullable: true })
  @IIF((self: FindOneSlugOrIdInput) => !self.id)
  slug?: string | undefined;
}
