import { sendEmail } from "../services/mailService.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import redisClient from "../services/redisService.js";
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";

export default class AuthController {

	constructor () {
		this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
		this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
	}

	_generateAccessToken(payload) {
		return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
	}

	_generateRefreshToken(payload, tokenId) {
		return jwt.sign(
			{...payload, token_id: tokenId },
			this.REFRESH_TOKEN_SECRET, 
			{ expiresIn: '7d' });
	}

	async refreshAccessToken(req, res) {
		const { refresh_token: refreshToken } = req.body;

		if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

		try {
			const payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);

			const genuineRefreshToken = await redisClient.get(
				`refresh_token:${payload.token_id}`
			);

			console.log(genuineRefreshToken);
			if (refreshToken !== genuineRefreshToken) {
				throw new Error('Invalid refresh token')
			}

			const { exp, iat, ...safePayload } = payload;

			const accessToken = this._generateAccessToken(safePayload);

			return res.status(200).json({
				'access_token': accessToken
			});

		} catch (err) {
			return res.status(400).json({ error: err.message});
		}
	}

	async login (req, res) {
		try {
			const { email, password }  = req.body;
			const user = await User.findOne({ email: email });

			if (!user) {
				return res.status(401).json({ message: 'Неверный email или пароль' });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) return res.status(401).json({ message: 'Неверный email или пароль' });

			const { password: _, ...userData } = user.toObject();

			const refreshTokenId = uuidv4();

			const accessToken = this._generateAccessToken({ id: userData._id});
			const refreshToken = this._generateRefreshToken(
				{ id: userData._id }, 
				refreshTokenId
			);

			await redisClient.set(
				`refresh_token:${refreshTokenId}`,
				refreshToken,
				{ EX: 60 * 60 * 24 * 7 }
			)

			return res.status(200).json({ 
				user: userData, 
				access_token: accessToken,
				refresh_token: refreshToken
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}

	async confirmEmail(req, res) {
		try {
			const { email, code } = req.body;

			const savedCode = await redisClient.get(`email_confirm_code:${email}`);

			if (!savedCode) {
				return res.status(400).json({ error: 'Код подтверждения не найден или истёк' });
			}

			if (savedCode !== code) {
				return res.status(400).json({ error: 'Неверный код подтверждения' });
			}

			await User.updateOne({ email }, { email_verified: true });

			await redisClient.del(`email_confirm_code:${email}`)

			res.json({ 
				message: 'Email успешно подтвержден' 
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}

	async register(req, res) {
		try {
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
			
			await redisClient.set(`email_confirm_code:${email}`, code, {EX: 600});

			await sendEmail(email, 'Код подтверждения регистрации', `Ваш код подтверждения: ${code}`);
	
			const { _id: userId, name: userName, email: userEmail} = user.toObject();
			
			const userData = { id: userId, name: userName, email: userEmail }
	
			return res.status(201).json({message: 'Пользователь создан', userData});
		} catch (err) {
			console.error('Ошибка регистрации: ', err);
			return res.status(500).json({ error: 'Ошибка при регистрации' });
		}
	}
}