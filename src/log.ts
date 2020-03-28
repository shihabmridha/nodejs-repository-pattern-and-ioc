import * as winston from 'winston';
import * as fs from 'fs';

// Create log directory if it doesn't exists
if (!fs.existsSync('logs')) {
  fs.mkdir('logs', (err) => {
    if (err) {
      logger.error('Couldn\'t create logs directory');
    } else {
      logger.info('Created logs directory');
    }
  });
}

const file = new winston.transports.File({ filename: 'logs/error.log', level: 'error' });
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
