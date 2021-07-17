import { promisify } from 'util';
import { RedisClient } from 'redis';
import { Container } from 'typedi';
import config from '~/config';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeCache(prefix: string, defaultLifetime?: number | undefined) {
  const client = Container.get(RedisClient);

  const prefixKey = (key: string) => `${prefix}.${key}`;
  return {
    get: async (key: string) => promisify(client.get).bind(client)(prefixKey(key)),
    has: async (key: string) => (
      // eslint-disable-next-line @typescript-eslint/ban-types
      Boolean(await (<Function>promisify(client.exists).bind(client))(prefixKey(key)))
    ),
    set: async (key: string, val: string, lifetime?: number | undefined) => {
      await promisify(client.set).bind(client)(prefixKey(key), val);
      if (lifetime || defaultLifetime) {
        await promisify(client.expire).bind(client)(prefixKey(key), lifetime! || defaultLifetime!);
      }
    },
    delete: async (key: string) => (
      // eslint-disable-next-line @typescript-eslint/ban-types
      Boolean(await (<Function><unknown>promisify(client.del).bind(client))(prefixKey(key)))
    ),
  };
}
