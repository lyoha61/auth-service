import { createClient, RedisClientType } from 'redis';
import { IRedisService } from '../interfaces/redisService.js';

export default class RedisService implements IRedisService  {

	constructor (private client: RedisClientType) {}

	public async get<T>(key: string): Promise<T | string | null> {
		const data = await this.client.get(key);
		if (!data) return null;

		try {
			return await JSON.parse(data) as T;
		} catch {
			return data;
		}
	}

	public async set (key: string, value: any, options?: { EX?:number }): Promise<void> {
		await this.client.set(key, value, options);
	}

	public async del (key: string): Promise<void> {
		await this.client.del(key);
	}
}