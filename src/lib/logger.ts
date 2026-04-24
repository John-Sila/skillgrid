export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

export const logger = {
  log: (level: LogLevel, message: string, context?: any) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
    
    // In dev, print to console
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${entry.timestamp}] [${level.toUpperCase()}] ${message}\x1b[0m`, context || '');
    
    // In production, you could send this to an external service like Sentry or a custom endpoint
  },
  info: (message: string, context?: any) => logger.log('info', message, context),
  warn: (message: string, context?: any) => logger.log('warn', message, context),
  error: (message: string, context?: any) => logger.log('error', message, context),
  debug: (message: string, context?: any) => logger.log('debug', message, context),
};
