import { sendEmail } from "../services/mailService.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import redisClient from "../services/redisService.js";

export default class AuthController {

	async login (req, res) {
		try {
			const { email, password }  = req.body;
			const user = await User.findOne({email : email});

			if (!user) {
				return res.status(401).json({ message: 'Неверный email или пароль' });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) return res.status(401).json({ message: 'Неверный email или пароль' });

			const {password: _, ...userData} = user.toObject();

			return res.status(200).json({ user: userData });
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