import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("Uncaught UI error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <div className="animate-fade-in bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl border border-red-200 dark:border-red-900/50 max-w-lg w-full text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner border border-red-100 dark:border-red-900/50">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">System Error</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-4">
                            Terjadi kesalahan tak terduga pada tampilan. Silakan muat ulang halaman atau kembali ke menu utama.
                        </p>

                        <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left overflow-x-auto custom-scrollbar">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
                            <code className="text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-[2] flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                            >
                                <Home className="w-4 h-4" /> Menu
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
