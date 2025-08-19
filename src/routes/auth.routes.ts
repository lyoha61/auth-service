import { Router } from "express";
import AuthController from '../controllers/auth.controller.js';
import validateRegisterMiddleware from '../middlewares/validateRegisterMiddleware.js';
import validateLoginMiddleware from '../middlewares/validateLoginMiddleware.js';
import { IRedisService } from "../interfaces/redisService.js";
import { IAuthConfig } from "../config/auth.config.js";

export default function createAuthRouter(
		redisService: IRedisService,
		config: IAuthConfig
	) {

	const authRouter = Router();
	const authController = new AuthController(redisService, config);

	authRouter.post(
		'/register', 
		validateRegisterMiddleware, 
		authController.register
	);
	authRouter.post(
		'/login', 
		validateLoginMiddleware, 
		authController.login
	);
	authRouter.post(
		'/logout', 
		authController.logout
	);
	authRouter.post(
		'/confirm-email', 
		authController.confirmEmail
	);
	authRouter.post(
		'/refresh-token', 
		authController.refreshAccessToken
	);

	return authRouter;
}
