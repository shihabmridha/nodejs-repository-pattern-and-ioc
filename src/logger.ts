import { createLogger, format, transports } from 'winston';

const { combine, label, timestamp, printf } = format;
// Make sure this exists
const LOG_FILE_PATH = 'logs/error.log';

const file = new transports.File({ filename: LOG_FILE_PATH, level: 'error' });
const console = new transports.Console();

const logFormat = printf(({ level, message, label: logLabel, timestamp: logTimestamp }) => {
  return `${logTimestamp} [${logLabel}] ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(label({ label: process.env.NODE_ENV }), timestamp(), logFormat),
  transports: [file],
});

if (process.env.NODE_ENV !== 'production') {
  logger.remove(file);
  logger.add(console);
}

export default logger;
