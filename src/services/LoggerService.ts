import { createLogger, format, transports } from 'winston';

// Constantes para valores reutilizáveis
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const ERROR_LOG_FILE = 'logs/error.log';
const COMBINED_LOG_FILE = 'logs/combined.log';

// Função para criar o logger
function createLoggerInstance() {
    return createLogger({
        level: LOG_LEVEL,
        format: format.combine(
            format.timestamp({ format: TIMESTAMP_FORMAT }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: ERROR_LOG_FILE, level: 'error' }),
            new transports.File({ filename: COMBINED_LOG_FILE })
        ]
    });
}

// Instância do logger
const logger = createLoggerInstance();

// Tratamento de erros no logger
logger.on('error', (err) => {
    console.error('Logger encountered an error:', err);
});

export default logger;