import React, { useRef, useEffect } from 'react';
import { PenLine, Check, Send } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import { useTheme } from '../context/ThemeContext';

const TranslationInput = ({ translation, setTranslation, onCheck, loading, disabled, onFocus, onBlur, minimalMode }) => {
    const textareaRef = useRef(null);
    const { playSFX } = useTheme();

    // Auto-resize textarea ONLY on mobile/small screens
    useEffect(() => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

        if (!isDesktop && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        } else if (isDesktop && textareaRef.current) {
            // Reset height on desktop to allow CSS flexbox to control it
            textareaRef.current.style.height = '100%';
        }
    }, [translation]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (translation.trim() && !disabled && !loading) {
                playSFX('click');
                onCheck();
            }
        }
    };

    return (
        <div className={`group bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-teal-900/5 flex-shrink-0 relative w-full ${minimalMode ? 'rounded-b-none border-b-0 shadow-none bg-transparent dark:bg-transparent' : ''}`}>
            {/* subtle focus border glow */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-focus-within:border-indigo-100 dark:group-focus-within:border-indigo-900 pointer-events-none transition-colors duration-500" />

            <div className={`flex-grow flex flex-col relative z-10 overflow-hidden ${minimalMode ? 'p-0 pb-1' : 'p-6 sm:p-8'}`}>
                {!minimalMode && (
                    <label htmlFor="translation" className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white mb-6 cursor-pointer group/label flex-shrink-0">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 group-hover/label:bg-indigo-100 dark:group-hover/label:bg-indigo-900/50 transition-colors">
                            <PenLine className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Terjemahan Anda
                    </label>
                )}

                <div className="relative group/input flex-grow flex flex-col">
                    <textarea
                        ref={textareaRef}
                        id="translation"
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { onFocus?.(); }}
                        onBlur={onBlur}
                        disabled={disabled}
                        placeholder="Ketik terjemahan bahasa Indonesia di sini..."
                        className="w-full flex-grow p-0 bg-transparent border-none text-xl sm:text-2xl text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-0 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium leading-relaxed scrollbar-thin scrollbar-thumb-indigo-100 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    />

                    {/* Floating hint/instruction - Hide in minimal mode */}
                    {!minimalMode && (
                        <div className="absolute bottom-0 right-0 pointer-events-none">
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${translation ? 'text-indigo-400 dark:text-indigo-300 translate-y-0 opacity-100' : 'text-slate-300 dark:text-slate-600 translate-y-2 opacity-0'}`}>
                                <span>Siap diperiksa</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar - Hide in minimal mode */}
            {!minimalMode && (
                <div className="relative z-10 bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm flex-shrink-0 rounded-b-3xl">
                    <div className="hidden sm:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Tekan <span className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 mx-1 font-mono">Enter</span> untuk kirim
                    </div>
                    <button
                        onClick={() => { playSFX('click'); onCheck(); }}
                        disabled={disabled || !translation.trim() || loading}
                        className="flex ml-auto items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-5 h-5 stroke-[3]" />
                        )}
                        <span className="tracking-wide text-sm">{loading ? 'Menilai...' : 'Periksa'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TranslationInput;
