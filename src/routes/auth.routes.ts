import { Router } from "express";
import AuthController from '../controllers/AuthController.js';
import validateRegisterMiddleware from '../middlewares/validateRegisterMiddleware.js';
import validateLoginMiddleware from '../middlewares/validateLoginMiddleware.js';

const authRouter = Router();
const authController = new AuthController();

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

export default authRouter;