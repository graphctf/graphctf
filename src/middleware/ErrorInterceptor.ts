import { MiddlewareFn } from 'type-graphql';
import { warn } from '~/log';

export const ErrorInterceptor: MiddlewareFn<any> = async ({ info }, next) => {
  try {
    return await next();
  } catch (err) {
    warn('server', `[${info.path.typename} ${info.path.key}] ${err.toString()}`)
    throw err;
  }
};
