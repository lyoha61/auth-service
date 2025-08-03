import "express";

declare module 'express' {
	interface Request {
		login?: string;
	}
}