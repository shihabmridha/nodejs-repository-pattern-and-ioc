import { createLogger, format, transports } from 'winston';
import { provider } from '../di.provider';

const { combine, label, timestamp, printf } = format;
const LOG_FILE_PATH = 'logs/error.log'; // Make sure this exists

const file = new transports.File({ filename: LOG_FILE_PATH, level: 'error' });
const console = new transports.Console();

const logFormat = printf(
  ({ level, message, label: logLabel, timestamp: logTimestamp }) => {
    return `${logTimestamp} [${logLabel}] ${level}: ${message}`;
  },
);

const logger = createLogger({
  level: provider.configuration.logLevel || 'info',
  format: combine(
    label({ label: provider.configuration.env }),
    timestamp(),
    logFormat,
  ),
  transports: [file],
});

if (provider.configuration.env !== 'production') {
  logger.remove(file);
  logger.add(console);
}

export default logger;
