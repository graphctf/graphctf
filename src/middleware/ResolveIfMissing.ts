import { UseMiddleware } from 'type-graphql';
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types';
import Container from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import { debug } from '~/log';

type PrismaUtilityMethods = '$connect' | '$disconnect' | '$on' | '$use' | '$executeRaw' | '$queryRaw' | '$transaction';
type PrismaModelMethods = Omit<PrismaClient, PrismaUtilityMethods>;
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export function ResolveIfMissing<
  TableName extends keyof PrismaModelMethods,
  Delegate extends PrismaClient[TableName],
  FindUnique extends Delegate["findUnique"],
  FindMany extends Delegate["findMany"],
  FindUniqueArgs extends Parameters<FindUnique>[0],
  FindManyArgs extends Parameters<FindMany>[0],
  ResultType extends NonNullable<ThenArg<ReturnType<FindUnique>>>,
>(
  tableName: TableName,
  finder: {
    unique: (obj: any) => FindUniqueArgs | Promise<FindUniqueArgs>,
    many?: undefined,
  } | {
    unique?: undefined,
    many: (obj: any) => FindManyArgs | Promise<FindManyArgs>,
  } | string | [keyof ResultType]
): MethodAndPropDecorator {
  return UseMiddleware(async ({ root, info }, next) => {
    const result = await next();
    if (typeof result !== 'undefined') return result;

    debug(
      'middleware',
      `Field ${info.fieldName} is missing, resolving from DB. (May result in slowdown.)`
    );

    const table = <Delegate>Container.get(PrismaClient)[tableName];
    if (typeof finder === 'string') {
      if (!root[finder]) return null;
      return await (<any>table.findUnique)({ where: { id: root[finder] } });
    } else if (Array.isArray(finder)) {
      return await (<any>table.findMany)({ where: { [finder[0]]: root.id }})
    }

    return await (
      finder.unique
        ? (<any>table.findUnique)(await finder.unique(root))
        : (<any>table.findMany)(await finder.many(root))
    );
  });
}
