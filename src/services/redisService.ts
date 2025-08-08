import {createClient, RedisClientType} from 'redis';

let redisClient: RedisClientType;

export function getRedisClient() {
	if(!redisClient) {
		redisClient = createClient({
			socket: {
				host: process.env.REDIS_HOST || 'localhost',
				port:  process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
			}
		});
		redisClient.on('error', (err) => console.error('Redis Client Error', err));
	}
	return redisClient;
}

export async function connectRedis() {
	if (!redisClient) getRedisClient();

	try {
		if (redisClient.isOpen !== false) {
			await redisClient.connect(); 
			console.log('Redis connected');
		}
	} catch (err) {
		console.error('Redis connect failed: ', err);
		process.exit(1);
	}
}