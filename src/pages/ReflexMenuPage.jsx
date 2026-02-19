import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, Bot, Trophy, Settings, Sparkles, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DIFFICULTIES = [
    { value: 1, label: "Beginner", speedDesc: "Relaxed", botTime: 15 },
    { value: 2, label: "Amateur", speedDesc: "Average", botTime: 12 },
    { value: 3, label: "Skilled", speedDesc: "Fast", botTime: 9 },
    { value: 4, label: "Expert", speedDesc: "Very Fast", botTime: 7 },
    { value: 5, label: "Master", speedDesc: "Godlike", botTime: 5 },
];

const ReflexMenuPage = () => {
    const navigate = useNavigate();
    const { playSFX } = useTheme();
    const [mode, setMode] = useState('benchmark'); // 'benchmark' or 'versus'
    const [difficulty, setDifficulty] = useState(3);

    const handleStart = () => {
        playSFX('click');
        navigate('/reflex/game', { state: { mode, difficulty } });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-rose-100/40 dark:bg-rose-900/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-orange-100/40 dark:bg-orange-900/10 rounded-full blur-3xl opacity-50" />
            </div>

            <button
                onClick={() => { playSFX('click'); navigate('/'); }}
                className="absolute top-6 left-6 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm backdrop-blur-md z-20 flex items-center gap-2 font-bold"
            >
                <ChevronLeft className="w-5 h-5" /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white/60 dark:bg-slate-950/30 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_-20px_rgba(0,0,0,0.6)] border border-white/40 dark:border-white/10 p-6 md:p-10 relative z-10"
            >
                <div className="flex items-center gap-5 mb-10 border-b border-slate-200/50 dark:border-white/5 pb-8">
                    <div className="p-4 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-rose-500/20 ring-1 ring-white/20">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Reflex Arena
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
                            Test your speed • 5 Rounds • 1 to 10
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Mode Selection */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 mb-4">
                            <Sparkles className="w-4 h-4" /> Game Mode
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => { setMode('benchmark'); playSFX('click'); }}
                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${mode === 'benchmark'
                                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-lg shadow-rose-500/10'
                                        : 'border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-rose-200 dark:hover:border-rose-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold font-sans">Benchmark</h3>
                                    <Trophy className={`w-6 h-6 ${mode === 'benchmark' ? 'text-rose-500' : 'opacity-50'}`} />
                                </div>
                                <p className="text-sm opacity-80 font-medium">Test your raw reaction speed against the clock for 5 rounds.</p>
                            </button>

                            <button
                                onClick={() => { setMode('versus'); playSFX('click'); }}
                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${mode === 'versus'
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 shadow-lg shadow-orange-500/10'
                                        : 'border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-orange-200 dark:hover:border-orange-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold font-sans">Versus Bot</h3>
                                    <Bot className={`w-6 h-6 ${mode === 'versus' ? 'text-orange-500' : 'opacity-50'}`} />
                                </div>
                                <p className="text-sm opacity-80 font-medium">Race against an AI opponent with adjustable difficulty levels.</p>
                            </button>
                        </div>
                    </div>

                    {/* Difficulty Selection for Versus Mode */}
                    <AnimatePresence>
                        {mode === 'versus' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-2 pb-4">
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 mb-4">
                                        <Settings className="w-4 h-4" /> Bot Difficulty
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {DIFFICULTIES.map((diff) => (
                                            <button
                                                key={diff.value}
                                                onClick={() => { setDifficulty(diff.value); playSFX('click'); }}
                                                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${difficulty === diff.value
                                                        ? 'bg-slate-900 dark:bg-orange-600 text-white border-transparent shadow-xl'
                                                        : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-xl font-black">{diff.value}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{diff.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            Bot speed: <span className="text-orange-500 font-bold">{DIFFICULTIES.find(d => d.value === difficulty)?.speedDesc}</span> (~{DIFFICULTIES.find(d => d.value === difficulty)?.botTime}s per round)
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Start Button */}
                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStart}
                            className="w-full p-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex flex-col items-center">
                                <h3 className="text-2xl font-black tracking-wide">
                                    Start Arena
                                </h3>
                                <p className="text-[10px] opacity-90 font-bold uppercase tracking-widest mt-1">
                                    {mode === 'benchmark' ? '5 Rounds • Free Play' : `Vs Bot Level ${difficulty} • 5 Rounds`}
                                </p>
                            </div>
                            <Play className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all fill-current absolute right-8" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Add AnimatePresence to imports
import { AnimatePresence } from 'framer-motion';

export default ReflexMenuPage;
