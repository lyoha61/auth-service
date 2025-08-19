import { jest } from '@jest/globals';
import { execSync } from 'child_process';


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

let redis: any;

beforeAll(async () => {
  const { connectRedis } = await import('../src/config/redisClient.js');
  redis = connectRedis();

  execSync('docker compose -f docker-compose.test.yml up -d');
  process.env.DATABASE_URL="postgresql://postgres:postgres@localhost:5433/authdb_test";
  execSync('npx prisma migrate deploy', { env: {...process.env},  stdio: 'inherit' });

});

beforeEach(async () => {
	 
  await redis.flushAll?.();
});

afterAll(async () => {
  await redis.quit?.();
  execSync('docker compose -f docker-compose.test.yml down -v');
});
