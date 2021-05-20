/* eslint-disable @typescript-eslint/no-non-null-assertion, node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

['DATABASE_URL', 'REDIS_URL', 'REDIS_PREFIX', 'AUTH_SECRET', 'AUTH_AUDIENCE']
  .forEach((req) => { if (!process.env[req]) throw Error(`The ${req} environment variable is required.`); });

const config = {
  debug: process.env.NODE_ENV !== 'production',
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 5000,
  redis: {
    url: process.env.REDIS_URL!,
    prefix: process.env.REDIS_PREFIX!,
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
    audience: process.env.AUTH_AUDIENCE!,
  },
};

export default config;
