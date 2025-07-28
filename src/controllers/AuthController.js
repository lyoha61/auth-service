import { sendEmail } from "../mailService.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';

export default class AuthController {

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