import express, {Request, Response, NextFunction} from 'express';
import connect from './config/db.js';
import authRouter from './routes/auth.routes.js';

const app = express();
await connect();
console.log('MongoDB connected ✅');

app.use(express.json());

app.use('/auth', authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err);
})

app.listen(3000, function() {
	console.log('Auth service running in 3000');
})

