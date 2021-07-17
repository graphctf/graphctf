import { Redis } from 'ioredis';
import { Container } from 'typedi';

export function makeCache(prefix: string, defaultLifetime?: number | undefined) {
  const client = Container.get<Redis>('redis');

  const prefixKey = (key: string) => `${prefix}.${key}`;
  return {
    get: async (key: string) => client.get(prefixKey(key)),
    has: async (key: string) => Boolean(await client.exists(prefixKey(key))),
    set: async (key: string, val: string, lifetime?: number | undefined) => {
      const expireLifetime = lifetime || defaultLifetime;
      await client.set(
        prefixKey(key),
        val,
        lifetime ? 'px' : undefined,
        lifetime
      );
    },
    delete: async (key: string) => Boolean(await client.del(prefixKey(key))),
  };
}
