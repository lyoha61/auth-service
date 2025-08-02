import Joi from "joi";

export const jwtPayloadSchema = Joi.object({
	id: Joi.string().required(),
	token_id: Joi.string().required()
})