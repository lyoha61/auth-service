import mongoose from "mongoose";
import logger from "../logger.js";

export default async function connect() {
	try {
		const uri = process.env.MONGO_URI;

		if (!uri) {
			throw new Error("MONGO_URI is not defined");
		}

		await mongoose.connect(uri);
	} catch (err) {
		logger.info('Failed to connect');
	}
}