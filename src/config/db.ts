import mongoose from "mongoose";

export default async function connect() {
	try {
		const uri = process.env.MONGO_URI;

		if (!uri) {
			throw new Error("MONGO_URI is not defined");
		}

		await mongoose.connect(uri);
	} catch (err) {
		console.log('❌ Failed to connect');
	}
}