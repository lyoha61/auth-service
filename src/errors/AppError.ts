export class AppError extends Error {
	public logged?: boolean;

	constructor(message: string, public statusCode = 500) {
		super(message);
		this.logged = false;

		Object.setPrototypeOf(this, AppError.prototype);
	}
}