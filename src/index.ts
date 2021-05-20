/* eslint-disable import/first */
import { registerDi } from './di';

registerDi();

import server from './server';

server();
