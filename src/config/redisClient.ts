import { createClient, RedisClientType } from "redis";
import logger from "../logger.js";

let redisClient: RedisClientType | null = null;

export async function getRedisClient (): Promise< RedisClientType > {
	if (!redisClient) {
		redisClient = createClient({
			socket: {
				host: process.env.REDIS_HOST || 'localhost',
				port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
			}
		})
	
		redisClient.on('error', (err) => console.error('Redis Client Error', err));
	}

	return redisClient;
};

export async function connectRedis(): Promise<void> {
	const client = await getRedisClient();
	if (!client.isOpen) {
		client.on('connect', () => logger.info('Redis client connected'));
		client.on('error', (err) => logger.error('Redis Client Error', err));
		client.on('reconnecting', () => logger.warn('Redis client reconnecting'));
		await client.connect()
	};
}