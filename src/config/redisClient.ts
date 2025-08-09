import { createClient, RedisClientType } from "redis";

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
	if (!client.isOpen) await client.connect();
}