import Joi from "joi";
import { SignOptions } from "jsonwebtoken";

export interface IAuthConfig {
	readonly ACCESS_TOKEN_SECRET: string;
	readonly REFRESH_TOKEN_SECRET: string;
	readonly ACCESS_TOKEN_EXPIRES_IN: SignOptions['expiresIn'];
	readonly REFRESH_TOKEN_EXPIRES_IN: SignOptions['expiresIn'];
	readonly EMAIL_CONFIRM_CODE_EXPIRES: number;
	readonly REFRESH_TOKEN_REDIS_EXPIRES_IN: number;
}

const authConfigSchema = Joi.object<IAuthConfig> ({
	ACCESS_TOKEN_SECRET: Joi.string().required().messages({
		'string.empty': 'ACCESS_TOKEN_SECRET must be not empty'
		}),
	REFRESH_TOKEN_SECRET: Joi.string().required().messages({
		'string.empty': 'REFRESH_TOKEN_SECRET must be not empty'
		}),
	ACCESS_TOKEN_EXPIRES_IN: Joi.alternatives()
		.try(
			Joi.string().pattern(/^[0-9]+[smhd]$/),
			Joi.number().positive()
		)
		.default('15m')
		.messages({
			'string.pattern.base': 'ACCESS_TOKEN_EXPIRES_IN must be a valid time format'
		}),
	REFRESH_TOKEN_EXPIRES_IN: Joi.alternatives()
		.try(
			Joi.string().pattern(/^[0-9]+[smhd]$/),
			Joi.number().positive()
		)
		.default('7d')
		.messages({
			'string.pattern.base': 'REFRESH_TOKEN_EXPIRES_IN must be a valid time format'
		}),
	EMAIL_CONFIRM_CODE_EXPIRES: Joi.number().required().positive().messages({
		'number.base': 'EMAIL_CONFIRM_CODE_EXPIRES is not valid'
	}),
	REFRESH_TOKEN_REDIS_EXPIRES_IN: Joi.number().required().positive(). messages({
		'number.base': 'REFRESH_TOKEN_REDIS_EXPIRES_IN is not valid'
	})
});

export function createAuthConfig(env: NodeJS.ProcessEnv = process.env): IAuthConfig {
	const config = {
		ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
		REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
		ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN,
		REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
		EMAIL_CONFIRM_CODE_EXPIRES: Number(env.EMAIL_CONFIRM_CODE_EXPIRES),
		REFRESH_TOKEN_REDIS_EXPIRES_IN: Number(env.REFRESH_TOKEN_REDIS_EXPIRES_IN)
	}

	const {error, value} = authConfigSchema.validate(config, {convert: true});

	if (error) throw error

	return value as IAuthConfig;
};