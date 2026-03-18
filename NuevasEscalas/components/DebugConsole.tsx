import { useState, useEffect, useRef } from 'react';
import { logger, LogEntry } from '../utils/logger';
import { Minimize2, Trash2, Bug } from 'lucide-react';

export const DebugConsole = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Subscribe to logger events
        const unsubscribe = logger.subscribe((entry) => {
            if (entry.id === 'clear') {
                setLogs([]);
            } else {
                setLogs(prev => [...prev, entry]);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom on new log
        if (!isMinimized && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isMinimized]);

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[9999]">
                <button 
                    onClick={() => setIsMinimized(false)}
                    className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 flex items-center gap-2 border border-blue-500/30"
                    title="Abrir Consola de Depuración"
                >
                    <Bug size={20} className="text-blue-400" />
                    {logs.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {logs.length > 99 ? '99+' : logs.length}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gray-900 border-t border-gray-700 shadow-2xl z-[9999] flex flex-col font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Bug size={16} className="text-blue-400" />
                    <span className="text-gray-200 font-bold">ScaleForge Debugger</span>
                    <span className="text-gray-500 ml-2">({logs.length} eventos)</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => logger.clear()} 
                        className="p-1 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded"
                        title="Limpiar Logs"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button 
                        onClick={() => setIsMinimized(true)} 
                        className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                        title="Minimizar"
                    >
                        <Minimize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-950/90 text-gray-300 space-y-2">
                {logs.length === 0 && (
                    <div className="text-center text-gray-600 italic py-8">
                        Esperando eventos... navega por la app para ver actividad.
                    </div>
                )}
                
                {logs.map((log) => (
                    <div key={log.id} className="border-l-2 p-1 pl-2 mb-1 animate-in fade-in slide-in-from-left-2 duration-200" style={{
                        borderColor: log.level === 'error' ? '#ef4444' : log.level === 'warn' ? '#f59e0b' : '#3b82f6',
                        backgroundColor: log.level === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                    }}>
                        <div className="flex gap-2 mb-1">
                            <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>
                            <span className={`font-bold uppercase ${
                                log.level === 'error' ? 'text-red-400' : 
                                log.level === 'warn' ? 'text-yellow-400' : 'text-blue-400'
                            }`}>
                                {log.level}
                            </span>
                            <span className="text-gray-200">{log.message}</span>
                        </div>
                        
                        {log.data && (
                            <details className="ml-14">
                                <summary className="cursor-pointer text-gray-500 hover:text-gray-300 select-none">
                                    Ver detalles (JSON)
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-900 rounded overflow-x-auto text-[10px] text-green-400">
                                    {JSON.stringify(log.data, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};
