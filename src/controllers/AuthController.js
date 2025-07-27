import { User } from "../models/User.js";

export default class AuthController {

	async register(req, res) {
		const { name, email, password } = req.body;

		const user = new User({ name, email, password });

		await user.save();

		return res.status(201).json({message: 'Пользователь создан'}, user);
	}
}