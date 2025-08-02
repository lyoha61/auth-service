import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export default function validateRegisterMiddleware(req: Request, res: Response, next: NextFunction) {
	const registerSchema = Joi.object({
		name: Joi.string()
			.min(3)
			.max(30)
			.required()
			.messages({
				'any.required': 'Поле name обязательно'
			}),
		email: Joi.string()
			.min(6)
			.required()
			.messages({
				'any.required': 'Поле email обязательно'
			}),
		password: Joi.string()
			.min(6)
			.required()
			.messages({
				'any.required': 'Поле password обязательно'
			}),
	});

	const { error } = registerSchema.validate(req.body);

	if (error) {
		return res.status(400).json({ error: error.details?.[0]?.message });
	}

	next();
}