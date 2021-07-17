/* eslint-disable import/first */
import './aliases';
import 'reflect-metadata';
import { registerDi } from './di';

registerDi();

import server from './server';

server();
