import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, RefreshCw, Home, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
// Actually, let's omit Confetti unless we know it's installed. The standard is just a nice layout without unknown libraries.

const ReflexResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { playSFX } = useTheme();

    // Fallback if accessed without state
    const { config, roundTimes } = location.state || {
        config: { mode: 'benchmark', difficulty: 3 },
        roundTimes: Array(5).fill({ time: 5000, botWon: false })
    };

    const { mode, difficulty } = config;

    // Calculations
    const totalTimeMs = roundTimes.reduce((acc, curr) => acc + curr.time, 0);
    const avgTimeMs = totalTimeMs / roundTimes.length;

    // Versus Mode specific
    let botWins = 0;
    let playerWins = 0;
    if (mode === 'versus') {
        roundTimes.forEach(rt => {
            if (rt.botWon) botWins++;
            else playerWins++;
        });
    }

    const playerWonOverall = playerWins > botWins;

    const formatTime = (ms) => (ms / 1000).toFixed(3);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-30 ${playerWonOverall && mode === 'versus' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 p-8 md:p-12 relative z-10"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-rose-500/20 mb-6">
                        {mode === 'versus' ? (playerWonOverall ? <Trophy className="w-10 h-10" /> : <Target className="w-10 h-10" />) : <Zap className="w-10 h-10" />}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        {mode === 'versus'
                            ? (playerWonOverall ? 'Victory!' : 'Defeat!')
                            : 'Benchmark Complete'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {mode === 'versus'
                            ? `You ${playerWonOverall ? 'won' : 'lost'} against Bot Level ${difficulty} (${playerWins}-${botWins})`
                            : 'Here are your reaction times for the 5 rounds.'}
                    </p>
                </motion.div>

                {/* Avg Score Highlight */}
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mb-10">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Average Clear Time</div>
                    <div className="text-5xl font-black text-rose-500 tabular-nums">
                        {formatTime(avgTimeMs)}s
                    </div>
                </motion.div>

                {/* Round List */}
                <motion.div variants={itemVariants} className="space-y-3 mb-10">
                    {roundTimes.map((rt, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Round {index + 1}</span>
                            <div className="flex items-center gap-4">
                                {mode === 'versus' && (
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${rt.botWon ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                                        {rt.botWon ? 'Bot Won' : 'Player Won'}
                                    </span>
                                )}
                                <span className="text-lg font-black font-mono text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-700 pl-4">
                                    {formatTime(rt.time)}s
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Actions */}
                <motion.div variants={itemVariants} className="flex gap-4">
                    <button
                        onClick={() => { playSFX('click'); navigate('/reflex'); }}
                        className="flex-1 flex items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <Home className="w-5 h-5" /> Menu
                    </button>
                    <button
                        onClick={() => { playSFX('click'); navigate('/reflex/game', { state: config }); }}
                        className="flex-[2] flex items-center justify-center gap-2 p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-rose-500/20"
                    >
                        <RefreshCw className="w-5 h-5" /> Play Again
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default ReflexResultPage;
