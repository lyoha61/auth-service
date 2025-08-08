import express, { Request, Response, NextFunction } from 'express';
import connect from './config/db.js';
import authRouter from './routes/auth.routes.js';
import { connectRedis } from './services/redisService.js';

const app = express();
await connect();
console.log('MongoDB connected ✅');

await connectRedis();

app.use(express.json());

app.use('/auth', authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err);
})


export default app;