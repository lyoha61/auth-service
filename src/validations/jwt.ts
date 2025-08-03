import Joi from "joi";

export const jwtPayloadSchema = Joi.object({
	id: Joi.string().required(),
	token_id: Joi.string().required(),
	iat: Joi.number().required(),
	// exp: Joi.number().required(),
})