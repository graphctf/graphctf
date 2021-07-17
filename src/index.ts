/* eslint-disable import/first */
import { install } from 'source-map-support';
install();

import './aliases';
import './di';
import 'reflect-metadata';
import server from './server';

server();
