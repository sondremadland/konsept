type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatLog(entry: LogEntry): void {
    const { timestamp, level, message, context, error } = entry;

    if (this.isDevelopment) {
      const style = this.getLogStyle(level);
      console[level](
        `%c[${timestamp}] ${level.toUpperCase()}: ${message}`,
        style,
        context || '',
        error || ''
      );
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444; font-weight: bold',
    };
    return styles[level];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context);
    this.formatLog(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, context);
    this.formatLog(entry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.formatLog(entry);
  }
}

export const logger = new Logger();
