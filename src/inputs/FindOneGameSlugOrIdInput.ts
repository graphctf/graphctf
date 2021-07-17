import { InputType, Field } from 'type-graphql';
import { IIF } from '~/validators';

export type FindOneGameSlugOrIdInputQuery = { id: string } | { slug: string, gameId: string };

@InputType()
export class FindOneGameSlugOrIdInput {
  @Field(() => String, { nullable: true })
  @IIF((self: FindOneGameSlugOrIdInput) => !self.slug)
  id?: string;

  @Field(() => String, { nullable: true })
  @IIF((self: FindOneGameSlugOrIdInput) => !self.id && Boolean(self.slug))
  gameId?: string

  @Field(() => String, { nullable: true })
  @IIF((self: FindOneGameSlugOrIdInput) => !self.id && Boolean(self.gameId))
  slug?: string;
}
