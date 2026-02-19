import React, { useMemo } from 'react';
import { MessageSquare, RefreshCw, Quote, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const ExerciseCard = ({ question, onNewQuestion, loading, minimalMode = false }) => {

    // Dynamic Font Sizing based on character length
    const fontSizeClass = useMemo(() => {
        if (!question) return 'text-xl sm:text-2xl';
        const length = question.length;
        if (length < 50) return 'text-2xl sm:text-4xl leading-normal';
        if (length < 100) return 'text-xl sm:text-3xl leading-relaxed';
        if (length < 200) return 'text-lg sm:text-2xl leading-relaxed';
        return 'text-base sm:text-xl leading-relaxed';
    }, [question]);

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/10 flex flex-col h-full w-full border border-slate-100/50 dark:border-slate-700">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 dark:bg-teal-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Header / Decoration */}
            <div className={`relative z-10 flex flex-col h-full overflow-hidden ${minimalMode ? 'p-4' : 'p-6 sm:p-8'}`}>
                <div className="flex items-center justify-between mb-4 sm:mb-6 opacity-60">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                        <div className="p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                            <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 fill-current" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono">Soal Latihan</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-grow overflow-y-auto scroll-smooth pr-2 custom-scrollbar flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4 w-full m-auto"
                            >
                                <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full w-3/4 animate-pulse" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full w-full animate-pulse delay-75" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full w-5/6 animate-pulse delay-150" />
                                <div className="h-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl w-full animate-pulse mt-8" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full m-auto py-4"
                            >
                                <p className={`font-medium text-slate-800 dark:text-slate-100 text-center sm:text-left ${fontSizeClass} transition-all duration-300 font-serif`}>
                                    {question || "Siap untuk mulai? Tekan tombol di bawah."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* FIXED FOOTER IN CARD - HIDDEN IN MINIMAL MODE */}
            {!minimalMode && (
                <div className="relative z-10 bg-slate-50/80 dark:bg-slate-800/80 px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm flex-shrink-0">
                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">
                        {question ? `${question.length} karakter` : 'Antigravity AI'}
                    </div>
                    <button
                        onClick={onNewQuestion}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-white bg-white dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-600 hover:border-slate-900 dark:hover:border-slate-900 rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
                    >
                        <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span>{loading ? 'Memuat...' : 'Ganti Soal'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExerciseCard;
