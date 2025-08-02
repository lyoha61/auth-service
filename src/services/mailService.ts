import nodemailer from 'nodemailer';

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
	console.log('Email sent: ', info.messageId);
}