import { Container } from 'typedi';
import { RedisRead, RedisWrite } from './RedisProxy';

export function makeCache(prefix: string, defaultLifetime?: number | undefined) {
  const read = Container.get(RedisRead);
  const write = Container.get(RedisWrite);

  const prefixKey = (key: string) => `${prefix}.${key}`;
  return {
    get: async (key: string) => read.get(prefixKey(key)),
    has: async (key: string) => Boolean(await read.exists(prefixKey(key))),
    set: async (key: string, val: string, lifetime?: number | undefined) => {
      const expireLifetime = lifetime || defaultLifetime;
      await write.set(
        prefixKey(key),
        val,
        lifetime ? 'px' : undefined,
        lifetime
      );
    },
    delete: async (key: string) => Boolean(await write.del(prefixKey(key))),
  };
}
