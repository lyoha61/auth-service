import pkg from "@prisma/client";
import { AppError } from "../errors/AppError.js";

import logger from "../logger.js";

const { PrismaClient } = pkg;

export const prisma = new PrismaClient();

export default async function connectDatabase() {
	try {
		await prisma.$connect();
		logger.info("Database connected");
	} catch (err: unknown) {
		if (err instanceof AppError) {
			logger.error(err.message);
		} else {
			logger.error("Uknown error", err);
		}
		throw err;
	}
}