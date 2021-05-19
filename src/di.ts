import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';

Container.set(PrismaClient, new PrismaClient());
