import express, {Request, Response, NextFunction} from 'express';
import AuthController from './controllers/AuthController.js';
import connect from './config/db.js';
import validateRegisterMiddleware from './middlewares/validateRegisterMiddleware.js';
import validateLoginMiddleware from './middlewares/validateLoginMiddleware.js';

const app = express();
await connect();
console.log('MongoDB connected ✅');

app.use(express.json());

const authController = new AuthController();

app.post('/register', validateRegisterMiddleware, authController.register.bind(authController));

app.post('/login', validateLoginMiddleware, authController.login.bind(authController));

app.post('/logout', authController.logout.bind(authController));

app.post('/confirm-email', authController.confirmEmail.bind(authController));

app.post('/refresh-token', authController.refreshAccessToken.bind(authController));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err);
})

app.listen(3000, function() {
	console.log('Auth service running in 3000');
})

