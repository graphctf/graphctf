import 'reflect-metadata';

const prismaRelationMetadataKey = Symbol('prismaRelation');

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
export function PrismaRelation(type: Function) {
  return Reflect.metadata(prismaRelationMetadataKey, type);
}

export type StaticThis<T, D> = { new(data: T): D };

export abstract class FromPrisma<T> {
  constructor(prismaData?: T | undefined | null) {
    if (!prismaData) return;

    Object.assign(this, prismaData);

    (<Array<keyof this>>Object.keys(this))
      .filter((k) => Reflect.hasMetadata(prismaRelationMetadataKey, this, k as string))
      .forEach((k) => {
        const HydrateType = Reflect.getMetadata(prismaRelationMetadataKey, this, k as string)();
        if (Array.isArray(HydrateType) && Array.isArray(this[k])) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this[k] = <any>(<Array<unknown>><unknown> this[k]).map((el) => new HydrateType[0](el));
        } else if (HydrateType && this[k]) {
          this[k] = new HydrateType(this[k]);
        }
      });
  }

  static FromArray<T, D extends FromPrisma<T>>(this: StaticThis<T, D>, data: Array<T>): Array<D> {
    return data.map((el) => new this(el));
  }
}
