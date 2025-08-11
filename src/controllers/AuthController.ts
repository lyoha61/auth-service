import { NextFunction, Request, Response } from "express";
import sendEmail from "../services/mailService.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import { jwtPayloadSchema } from "../validations/jwt.js";
import { IRedisService } from "../interfaces/redisService.js";
import { IAuthConfig } from "../config/auth.config.js";
import { LogMethod } from "../decorators/logMethod.js";
import Autobind from "../decorators/autobind.js";
import { AppError } from "../errors/AppError.js";


export default class AuthController {

	constructor (
		private redisService: IRedisService,
		private config: IAuthConfig
	) {}

	private generateAccessToken(payload: object) {
		return jwt.sign(
			payload, 
			this.config.ACCESS_TOKEN_SECRET, 
			{ expiresIn: this.config.ACCESS_TOKEN_EXPIRES_IN! }
		);
	}

	private generateRefreshToken(payload: object, tokenId: string) {
		return jwt.sign(
			{...payload, token_id: tokenId },
			this.config.REFRESH_TOKEN_SECRET, 
			{ expiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN! }
		);
	}

	private verifyAndValidRefreshToken(refreshToken: string) {
		const rawPayload = jwt.verify(refreshToken, this.config.REFRESH_TOKEN_SECRET);

		const { value: payload, error } = jwtPayloadSchema.validate(rawPayload);

		if (error) throw new Error(error.message);
		return payload;
	}

	@Autobind
	@LogMethod()
	async refreshAccessToken (req: Request, res: Response, next: NextFunction) {
		const { refresh_token: refreshToken } = req.body;

		if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

		const payload = this.verifyAndValidRefreshToken(refreshToken);

		const genuineRefreshToken = await this.redisService.get(
			`refresh_token:${payload.token_id}`
		);

		if (refreshToken !== genuineRefreshToken) {
			throw new Error('Invalid refresh token')
		}

		const { exp, iat, ...safePayload } = payload;

		const accessToken = this.generateAccessToken(safePayload);

		return res.status(200).json({
			'access_token': accessToken
		});
	}

	@Autobind
	@LogMethod()
	async login (req: Request, res: Response, next: NextFunction) {
		const { email, password }  = req.body;
		const user = await User.findOne({ email: email });

		if (!user) throw new AppError('Неверный email или пароль', 401);

		const isMatch = await bcrypt.compare(password, user.password!);
		if (!isMatch) throw new AppError('Неверный email или пароль', 401);

		const { password: _, ...userData } = user.toObject();

		const refreshTokenId = uuidv4();

		const accessToken = this.generateAccessToken({ id: userData._id});
		const refreshToken = this.generateRefreshToken(
			{ id: userData._id }, 
			refreshTokenId
		);

		await this.redisService.set(
			`refresh_token:${refreshTokenId}`,
			refreshToken,
			{ EX: this.config.REFRESH_TOKEN_REDIS_EXPIRES_IN }
		)

		return res.status(200).json({ 
			user: userData, 
			access_token: accessToken,
			refresh_token: refreshToken
		});
	}

	@Autobind
	@LogMethod()
	async logout (req: Request, res: Response, next: NextFunction) {
		const { refresh_token:  refreshToken } = req.body;

		const payload = this.verifyAndValidRefreshToken(refreshToken);

		const tokenId = payload.token_id;

		await this.redisService.del(`refresh_token:${tokenId}`);

		return  res.status(200).json({ message: 'Logged out successfully'});
	}

	@Autobind
	@LogMethod()
	async confirmEmail (req: Request, res: Response, next: NextFunction) {
		const { email, code } = req.body;

		const savedCode = await this.redisService.get(`email_confirm_code:${email}`);

		if (!savedCode) {
			return res.status(400).json({ error: 'Код подтверждения не найден или истёк' });
		}

		if (savedCode !== code) {
			return res.status(400).json({ error: 'Неверный код подтверждения' });
		}

		await User.updateOne({ email }, { email_verified: true });

		await this.redisService.del(`email_confirm_code:${email}`)

		res.json({ 
			message: 'Email успешно подтвержден' 
		});
	}

	@Autobind
	@LogMethod()
	async register(req: Request, res: Response, next: NextFunction) {
		const { name, email, password } = req.body;

		const exists = await User.findOne({ email });

		if (exists) {
			return res.status(409).json({ 
				error: 'Пользователь с таким email уже существует' 
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({ name, email, password: hashedPassword });

		await user.save();

		const code = Math.floor(1000 + Math.random() * 9000).toString();
		
		await this.redisService.set(
			`email_confirm_code:${email}`, 
			code, 
			{ EX: this.config.EMAIL_CONFIRM_CODE_EXPIRES }
		);

		await sendEmail(email, 'Код подтверждения регистрации', `Ваш код подтверждения: ${code}`);

		const { _id: userId, name: userName, email: userEmail} = user.toObject();
		
		const userData = { id: userId, name: userName, email: userEmail }

		return res.status(201).json({message: 'Пользователь создан', user: userData});

	}
}