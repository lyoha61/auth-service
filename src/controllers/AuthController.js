import { User } from "../models/User.js";

export class AuthController {

	async register(req, res) {
		const { email, password } = req.body;

		const user = new User({ email, password });

		await user.save();

		return res.status(201).json({message: 'Пользователь создан'}, user);
	}
}