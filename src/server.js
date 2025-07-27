import express from 'express';
import AuthController from './controllers/AuthController.js'
import connect from './config/db.js';
import validateRegisterMiddleware from './middlewares/validateRegisterMiddleware.js';

const app = express();
await connect(process.env.MONGO_URI)
console.log('MongoDB connected ✅');

app.use(express.json());

const authController = new AuthController();

app.get('/register', validateRegisterMiddleware, authController.register.bind(authController));

app.listen(3000, function() {
	console.log('Auth service running in 3000');
})