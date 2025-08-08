import { jest, describe, test, expect } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config() 

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    on: jest.fn(),
    get: jest.fn<(key: string) => Promise<string | null>>().mockResolvedValue('mocked_value'),
    set: jest.fn<(key: string, value: string) => Promise<'OK'>>().mockResolvedValue('OK'),
    flushAll: jest.fn<() => Promise<'OK'>>().mockResolvedValue('OK'),
    quit: jest.fn<() => Promise<'OK'>>().mockResolvedValue('OK'),
    isOpen: true,
  })),
}));

jest.mock('nodemailer', () => ({
    createTransport: () => ({
      sendMail: jest.fn(() => Promise.resolve({ messageId: 'mocked-id' })),
  })
}));

let mongo: MongoMemoryServer;
let redis: any;

beforeAll(async () => {
  const mod =  await import('../services/redisService.js');
  redis = mod.getRedisClient();


  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {
    dbName: 'test',
  });
});

beforeEach(async () => {
	  if (mongoose.connection.readyState !== 1) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once('connected', () => resolve());
    });
  }

  if (!mongoose.connection.db) {
    throw new Error('MongoDB not connected');
  }
  
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }

  await redis.flushAll?.();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  await redis.quit?.();
});
