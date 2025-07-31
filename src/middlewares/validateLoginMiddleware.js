import Joi from "joi";

export default function validateLoginMiddleware (req, res, next) {
	try {
		const loginSchema = Joi.object({
			name: Joi.string(),
			email: Joi.string().email(),
			password: Joi.string().required(),
		})
		.xor('name', 'email')
		.messages({
			'object.xor': 'Provide either "name" or "email" is required',
			'object.missing': 'Either "name" or "email" is required',
			'string.email': '"email" must be a valid email',
			'string.base': '{#label} must be a string',
			'string.empty': '{#label} cannot be empty',
			'any.required': '{#label} is required'
		});

		const { error, value } = loginSchema.validate(req.body);

		if (error) {
			throw new Error(error.details[0].message);
		}

		req.login = value.name || value.email;

		next();
	} catch(err) {
		res.status(400).json({error: err.message});
	}
}