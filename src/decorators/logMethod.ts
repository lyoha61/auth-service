import { AppError } from "../errors/AppError.js";
import logger from "../logger.js";

export function LogMethod() {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
			const req = args[0];
			const res = args[1];

			logger.info(`[${String(propertyKey)}] called`)

			try {
				const result = await originalMethod.apply(this, args);

				logger.info(`[${String(propertyKey)}] successed`);

				return result
			} catch (error: unknown) {
				if (error instanceof AppError) {
					logger.error(`[${String(propertyKey)}] failed: ${error.message}`);
					error.logged = true;
				}
				
				throw error;
			}

		}


		return descriptor;
	}
}