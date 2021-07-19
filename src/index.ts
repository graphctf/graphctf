/* eslint-disable import/first */
import 'reflect-metadata';
import { install } from 'source-map-support';
install();

import './aliases';
import './di';
import server from './server';

server();
