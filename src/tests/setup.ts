import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv'
dotenv.config() 

jest.mock('redis', () => ({
  createClient: jest.fn(() => {
      let isOpen = false;
      return {
        connect: jest.fn<() => Promise <void>>( async () => {
          isOpen = true;
        }),
        on: jest.fn(),
        get: jest.fn<() => Promise <string>>().mockResolvedValue('mocked_value'),
        set: jest.fn<() => Promise<string>>().mockResolvedValue('OK'),
        flushAll: jest.fn<() => Promise<string>>().mockResolvedValue('OK'),
        quit: jest.fn<() => Promise<string>>(async () => {
          isOpen = false;
          return "OK"
        }),
          get isOpen() {
          return isOpen;
        }
      }
     
    }),
}));

jest.mock('nodemailer', () => ({
    createTransport: () => ({
      sendMail: jest.fn(() => Promise.resolve({ messageId: 'mocked-id' })),
  })
}));

let redis: any

beforeAll(async () => {
  const { connectRedis } = await import('../config/redisClient.js');
  redis = connectRedis();

});

beforeEach(async () => {
	 
  await redis.flushAll?.();
});

afterAll(async () => {

  await redis.quit?.();
});
