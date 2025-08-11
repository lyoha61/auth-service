import winston, { transports, format } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	),
	transports: [
		new transports.Console({
			format: combine(
				colorize(),
				printf(({ timestamp, level, message, stack }) => {
					return stack
					? `${timestamp} [${level}]: ${message} - ${stack}`
					: `${timestamp} [${level}]: ${message}`	
				})
			)
		})
	]
});

export default logger;