import debugFactory from 'debug';

const BASE = `graphctf`;

export const debug = (module: string, thing: any) => debugFactory(`${BASE}:${module}:debug`)(thing);
export const info = (module: string, thing: any) => debugFactory(`${BASE}:${module}:info`)(thing);
export const warn = (module: string, thing: any) => debugFactory(`${BASE}:${module}:warn`)(thing);
export const error = (module: string, thing: any) => debugFactory(`${BASE}:${module}:error`)(thing);
