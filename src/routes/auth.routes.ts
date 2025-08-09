import { Router } from "express";
import AuthController from '../controllers/AuthController.js';
import validateRegisterMiddleware from '../middlewares/validateRegisterMiddleware.js';
import validateLoginMiddleware from '../middlewares/validateLoginMiddleware.js';
import { IRedisService } from "../interfaces/redisService.js";

export default function createAuthRouter(redisService: IRedisService) {
	const authRouter = Router();
	const authController = new AuthController(redisService);

	authRouter.post(
		'/register', 
		validateRegisterMiddleware, 
		authController.register.bind(authController)
	);
	authRouter.post(
		'/login', 
		validateLoginMiddleware, 
		authController.login.bind(authController)
	);
	authRouter.post(
		'/logout', 
		authController.logout.bind(authController)
	);
	authRouter.post(
		'/confirm-email', 
		authController.confirmEmail.bind(authController)
	);
	authRouter.post(
		'/refresh-token', 
		authController.refreshAccessToken.bind(authController)
	);

	return authRouter;
}
