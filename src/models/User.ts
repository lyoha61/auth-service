import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	email_verified: {
		type: Boolean,
		default: false
	}
})

const User = mongoose.model('User', userSchema);

export default User;