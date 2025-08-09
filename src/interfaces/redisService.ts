export interface IRedisService {
	get<T>(key: string): Promise<T | string | null>;
	set(key: string, value: string, options?: { EX?: number }): Promise<void>
	del(key: string): Promise<void>
}