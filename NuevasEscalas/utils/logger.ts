export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

type LogListener = (entry: LogEntry) => void;

class DebugLogger {
  private listeners: LogListener[] = [];
  private history: LogEntry[] = [];
  private maxHistory = 100;

  constructor() {
    // Sobrescribir consola original para capturar todo (opcional, pero útil)
    // this.monkeyPatchConsole(); 
  }

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      level,
      message,
      data
    };
  }

  private emit(entry: LogEntry) {
    this.history = [entry, ...this.history].slice(0, this.maxHistory);
    this.listeners.forEach(listener => listener(entry));
    
    // Also log to browser console for development
    const style = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444; font-weight: bold'
    };
    console.log(`%c[${entry.level.toUpperCase()}] ${entry.message}`, style[entry.level], entry.data || '');
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getHistory(): LogEntry[] {
    return this.history;
  }

  public clear() {
    this.history = [];
    this.listeners.forEach(l => l({ 
        id: 'clear', 
        timestamp: new Date(), 
        level: 'info', 
        message: '--- Logs Cleared ---' 
    }));
  }

  public log(message: string, data?: any) {
    this.emit(this.createEntry('info', message, data));
  }

  public warn(message: string, data?: any) {
    this.emit(this.createEntry('warn', message, data));
  }

  public error(message: string, error?: any) {
    this.emit(this.createEntry('error', message, error));
  }
}

export const logger = new DebugLogger();
