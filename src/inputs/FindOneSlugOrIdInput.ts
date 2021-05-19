import { InputType, Field } from 'type-graphql';

export type FindOneSlugOrIdInputQuery = { id: string } | { slug: string };

@InputType()
export class FindOneSlugOrIdInput {
  @Field(() => String, { nullable: true })
  id?: string | undefined;

  @Field(() => String, { nullable: true })
  slug?: string | undefined;

  toQuery(): FindOneSlugOrIdInputQuery {
    if (!this.id && !this.slug) {
      throw Error(`Either id or slug must be specified.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.id ? { id: this.id! } : { slug: this.slug! };
  }
}
