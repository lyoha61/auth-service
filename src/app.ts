import express, { Request, Response, NextFunction } from 'express';
import connect from './config/db.js';
import { connectRedis, getRedisClient } from './config/redisClient.js';
import RedisService from './services/redisService.js';
import createAuthRouter from './routes/auth.routes.js';
import logger from './logger.js';
import { createAuthConfig } from './config/auth.config.js';
import { AppError } from './errors/AppError.js';

export default async function createApp() {
	await connect();
	logger.info('MongoDB connected');

	const redisClient = await getRedisClient();
	await connectRedis();
	const redisService =  new RedisService(redisClient);

	const authConfig = createAuthConfig();

	const app = express();

	app.use(express.json());
	app.use('/auth', createAuthRouter(redisService, authConfig));

	app.use((err: any, req: Request, res: Response, next: NextFunction) => {
		if (err instanceof AppError) {
			if (!err.logged) logger.error(err.message)
			return res.status(err.statusCode).json({ error: err });
		}
		logger.error(err.message)
		return res.status(500).json({ error: err });
	})

	return app;
} 

