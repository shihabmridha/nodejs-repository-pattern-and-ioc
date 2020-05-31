import * as winston from 'winston';

// Make sure this exists
const LOG_FILE_PATH = 'logs/error.log';

const file = new winston.transports.File({ filename: LOG_FILE_PATH, level: 'error' });
const console = new winston.transports.Console({ format: winston.format.simple() });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [file]
});

if (process.env.NODE_ENV !== 'production') {
  logger.remove(file);
  logger.add(console);
}

export default logger;
