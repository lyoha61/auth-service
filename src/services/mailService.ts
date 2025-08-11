import nodemailer from 'nodemailer';
import logger from '../logger.js';

const transporter = nodemailer.createTransport({
	host: process.env.MAILHOG_HOST,
	port:  Number(process.env.MAILHOG_PORT),
	secure: process.env.MAILHOG_SECURE === 'true'
});

export default async function sendEmail(
	to: string, 
	subject: string, 
	text: string
): Promise<void> {
	const info = await transporter.sendMail({
		from: '"Auth Service" <no-reply@example.com>',
		to,
		subject,
		text
	});
	logger.info(`Email sent. Message id: ${info.messageId}`);
}