import User from "../models/User.js";
import bcrypt from 'bcrypt';

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
	
			const { _id: userId, name: userName, email: userEmail} = user.toObject();
			
			const userData = { id: userId, name: userName, email: userEmail }
	
			return res.status(201).json({message: 'Пользователь создан', userData});
		} catch (err) {
			console.error('Ошибка регистрации: ', err);
			return res.status(500).json({ error: 'Ошибка при регистрации' });
		}
	}
}