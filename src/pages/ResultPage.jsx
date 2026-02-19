import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Home, BarChart3, Star, Sparkles, Info, AlertTriangle, XCircle, AlertOctagon, Lightbulb, CheckCircle2, XCircle as XCircleIcon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useTheme } from '../context/ThemeContext';

// --- Components ---

const CircularScore = ({ score }) => {
    const radius = 28; // Smaller radius for compact design
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "text-red-500 dark:text-red-400";
    if (score >= 90) color = "text-emerald-500 dark:text-emerald-400";
    else if (score >= 70) color = "text-teal-500 dark:text-teal-400";
    else if (score >= 50) color = "text-amber-500 dark:text-amber-400";

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle className="text-slate-100 dark:text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32" />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                />
            </svg>
            <span className={`absolute text-lg font-bold ${color}`}>{score}</span>
        </div>
    );
};

const Tooltip = ({ highlight }) => {
    const getTypeStyles = (type) => {
        switch (type) {
            case 'suggestion': return { icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-slate-800', border: 'border-blue-200 dark:border-blue-800', title: 'Saran' };
            case 'minor': return { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-slate-800', border: 'border-yellow-200 dark:border-yellow-800', title: 'Minor' };
            case 'major': return { icon: AlertOctagon, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-slate-800', border: 'border-orange-200 dark:border-orange-800', title: 'Major' };
            case 'fatal': return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-slate-800', border: 'border-red-200 dark:border-red-800', title: 'Fatal' };
            default: return { icon: Info, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', title: 'Info' };
        }
    };

    const style = getTypeStyles(highlight.type);
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className={`absolute z-50 w-56 p-3 rounded-xl shadow-xl bg-white dark:bg-slate-800 border ${style.border} bottom-full mb-2 left-1/2 -translate-x-1/2`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={`flex items-center gap-2 mb-1 pb-1 border-b ${style.border}`}>
                <Icon className={`w-3 h-3 ${style.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${style.color}`}>{style.title}</span>
            </div>
            <div>
                <p className={`text-xs font-bold ${style.color} mb-1`}>{highlight.correction}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{highlight.explanation}</p>
            </div>
            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r ${style.border} transform rotate-45`} />
        </motion.div>
    );
};

const InteractiveText = ({ text, highlights, showHighlights }) => {
    const [activeHighlight, setActiveHighlight] = useState(null);
    const safeText = text || "";

    if (!showHighlights || !highlights || !Array.isArray(highlights) || highlights.length === 0) {
        return <p className="text-base text-slate-800 dark:text-slate-200 font-serif leading-relaxed italic">"{safeText}"</p>;
    }

    let parts = [];
    const validHighlights = highlights.filter(h => h && h.text);
    const sortedHighlights = [...validHighlights].sort((a, b) => safeText.toLowerCase().indexOf(a.text.toLowerCase()) - safeText.toLowerCase().indexOf(b.text.toLowerCase()));

    let currentIndex = 0;
    const lowerText = safeText.toLowerCase();

    sortedHighlights.forEach((h, i) => {
        const hIndex = lowerText.indexOf(h.text.toLowerCase(), currentIndex);
        if (hIndex !== -1) {
            if (hIndex > currentIndex) {
                parts.push(<span key={`text-${i}`}>{safeText.substring(currentIndex, hIndex)}</span>);
            }

            const getTypeColor = (type) => {
                switch (type) {
                    case 'suggestion': return 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 decoration-blue-400/50 dark:decoration-blue-400/30';
                    case 'minor': return 'bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 decoration-yellow-400/50 dark:decoration-yellow-400/30';
                    case 'major': return 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 decoration-orange-400/50 dark:decoration-orange-400/30';
                    case 'fatal': return 'bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-200 decoration-red-400/50 dark:decoration-red-400/30';
                    default: return 'bg-slate-200 dark:bg-slate-700';
                }
            };

            parts.push(
                <span
                    key={`highlight-${i}`}
                    className={`relative inline-block cursor-pointer px-0.5 rounded transition-all hover:brightness-95 border-b-2 border-dashed mx-[1px] ${getTypeColor(h.type)}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveHighlight(activeHighlight === i ? null : i);
                    }}
                >
                    {safeText.substring(hIndex, hIndex + h.text.length)}
                    <AnimatePresence>
                        {activeHighlight === i && <Tooltip highlight={h} />}
                    </AnimatePresence>
                </span>
            );
            currentIndex = hIndex + h.text.length;
        }
    });

    if (currentIndex < safeText.length) {
        parts.push(<span key="text-end">{safeText.substring(currentIndex)}</span>);
    }

    return (
        <div className="text-base text-slate-800 dark:text-slate-200 font-serif leading-relaxed italic" onClick={() => setActiveHighlight(null)}>
            "{parts.length > 0 ? parts : safeText}"
        </div>
    );
};

// --- Main Page ---

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, config, question, userTranslation } = location.state || {};
    const [showHighlights, setShowHighlights] = useState(true);
    const { playSFX } = useTheme();
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Always start at top on Results Page

        if (result) {
            if (result.score >= 80) playSFX('success');
            else playSFX('error');
        } else {
            // Do not render if no result, gracefully fallback to Menu
            navigate('/');
        }
    }, [result, playSFX, navigate]);

    if (!result) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 font-sans text-slate-900 dark:text-white flex justify-center transition-colors duration-300">
            {/* History Detail Modal */}
            <AnimatePresence>
                {selectedHistoryItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedHistoryItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 relative custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedHistoryItem(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>

                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Question History Details</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Source Text</div>
                                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200">"{selectedHistoryItem.question}"</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Your Answer</div>
                                    <p className="text-slate-700 dark:text-slate-300 italic">"{selectedHistoryItem.userTranslation}"</p>
                                </div>

                                {selectedHistoryItem.result.better_translation && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                        <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Better Translation</div>
                                        <p className="text-emerald-800 dark:text-emerald-200 font-medium">"{selectedHistoryItem.result.better_translation}"</p>
                                    </div>
                                )}

                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Feedback</div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedHistoryItem.result.feedback}</p>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                                        <span className={`text-lg font-black ${selectedHistoryItem.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedHistoryItem.score}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">HP Change</span>
                                        <span className={`text-lg font-black ${selectedHistoryItem.hpChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {selectedHistoryItem.hpChange > 0 ? '+' : ''}{selectedHistoryItem.hpChange}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-6xl space-y-4">

                {/* 1. Header & Actions (Unified) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-4 md:flex-row w-full md:w-auto">
                        <CircularScore score={result.score} />
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {result.score >= 90 ? "Excellent Work!" : result.score >= 70 ? "Good Job!" : "Keep Practicing!"}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start text-xs font-medium text-slate-500 dark:text-slate-400 gap-2 mt-1">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{config.difficulty}</span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{config.topic}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={() => { playSFX('click'); navigate('/'); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">
                            <Home className="w-4 h-4" /> <span>Menu</span>
                        </button>

                        {/* Survival Mode Logic */}
                        {config.mode === 'survival' ? (
                            (() => {
                                /* Survival Mode 2.0 Logic */
                                const hpChange = Math.round(result.score - 75);
                                const currentHP = (location.state?.survivalState?.hp || 500); // Max 500 now
                                const newHP = Math.min(500, currentHP + hpChange); // Cap at 500
                                const isGameOver = newHP <= 0;
                                const questionsAnswered = (location.state?.survivalState?.questionsAnswered || 0) + 1;

                                // Level Up Check (Every 5 questions)
                                const isLevelUp = questionsAnswered > 0 && questionsAnswered % 5 === 0;
                                const nextDifficultyIdx = Math.min(5, Math.floor(questionsAnswered / 5));
                                const DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"];
                                const nextDifficulty = DIFFICULTIES[nextDifficultyIdx];

                                // Update History
                                const newHistoryItem = {
                                    question,
                                    userTranslation,
                                    score: result.score,
                                    hpChange,
                                    difficulty: config.difficulty, // Original difficulty of this question
                                    result // Store full result for transparency
                                };
                                const updatedHistory = [...(location.state?.survivalState?.history || []), newHistoryItem];

                                const nextSurvivalState = {
                                    hp: newHP,
                                    questionsAnswered,
                                    totalScore: (location.state?.survivalState?.totalScore || 0) + result.score,
                                    history: updatedHistory
                                };

                                if (isGameOver) {
                                    return (
                                        <div className="w-full flex justify-center md:justify-end">
                                            <button onClick={() => { playSFX('click'); navigate('/'); }} className="flex w-full md:w-auto items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl text-lg font-black shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all group">
                                                <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Finish Report
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                        <div className="flex items-center justify-between md:justify-end gap-4 text-sm font-bold bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                            <span className={`${hpChange >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
                                                {hpChange >= 0 ? <Zap className="w-3 h-3 fill-current" /> : <AlertTriangle className="w-3 h-3" />}
                                                {hpChange > 0 ? '+' : ''}{hpChange} HP
                                            </span>
                                            <span className="text-slate-400">|</span>
                                            <span className="text-slate-600 dark:text-slate-300">HP: {newHP} / 500</span>
                                        </div>

                                        {isLevelUp && (
                                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase text-center border border-amber-200 dark:border-amber-800 animate-bounce">
                                                💪 LEVEL UP! Difficulty &rarr; {nextDifficulty}
                                            </div>
                                        )}

                                        <button onClick={() => { playSFX('click'); navigate('/practice', { state: { config, survivalState: nextSurvivalState } }); }} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all">
                                            <Zap className="w-4 h-4" /> Next Question
                                        </button>
                                    </div>
                                );
                            })()
                        ) : (
                            <>
                                {/* Smart Retry Button (Only if not perfect) */}
                                {result.score < 100 && (
                                    <button
                                        onClick={() => {
                                            playSFX('click');
                                            const mistakeDetails = result.weakness || result.highlights?.map(h => h.explanation).join(", ") || "General improvement";
                                            const fullContext = `Original: "${question}". Issues: ${mistakeDetails}`;
                                            navigate('/practice', { state: { config, focusContext: fullContext } });
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <Zap className="w-4 h-4" /> Perbaiki Error
                                    </button>
                                )}

                                <button onClick={() => { playSFX('click'); navigate('/practice', { state: { config, question, retryMode: true } }); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-sm font-bold transition-all">
                                    <RefreshCw className="w-4 h-4" /> Ulangi
                                </button>
                                <button onClick={() => { playSFX('click'); navigate('/practice', { state: { config } }); }} className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/20 transition-all">
                                    <Sparkles className="w-4 h-4" /> Soal Baru
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Mobile Sticky Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 md:hidden flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] overflow-x-auto">
                    <button onClick={() => { playSFX('click'); navigate('/'); }} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-all flex-shrink-0">
                        <Home className="w-5 h-5" />
                    </button>

                    {(!isGameOver && result.score < 100) && (
                        <button
                            onClick={() => {
                                playSFX('click');
                                const mistakeDetails = result.weakness || result.highlights?.map(h => h.explanation).join(", ") || "General improvement";
                                const fullContext = `Original: "${question}". Issues: ${mistakeDetails}`;
                                navigate('/practice', { state: { config, focusContext: fullContext } });
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                        >
                            <Zap className="w-4 h-4" /> Fix Error
                        </button>
                    )}

                    {!isGameOver && (
                        <button onClick={() => { playSFX('click'); navigate('/practice', { state: { config, question, retryMode: true } }); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                            <RefreshCw className="w-4 h-4" /> Ulangi
                        </button>
                    )}
                    <button onClick={() => { playSFX('click'); navigate(isGameOver ? '/' : '/practice', { state: { config } }); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/20 transition-all whitespace-nowrap">
                        <Sparkles className="w-4 h-4" /> {isGameOver ? 'Finish' : 'Baru'}
                    </button>
                </div>

                {/* 2. Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-24 md:pb-0">

                    {/* A. Comparison Card (Top Left - Main Focus) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6"
                    >
                        {/* Source */}
                        <div className="relative pl-4 border-l-4 border-slate-200 dark:border-slate-700">
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Original Text</h3>
                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-snug">"{question}"</p>
                        </div>

                        {/* User Translation */}
                        <div className="relative pl-4 border-l-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 py-2 rounded-r-xl">
                            <div className="absolute top-0 right-2">
                                <button
                                    onClick={() => { playSFX('click'); setShowHighlights(!showHighlights); }}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${showHighlights ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                                >
                                    {showHighlights ? 'Hide Hints' : 'Show Hints'}
                                </button>
                            </div>
                            <h3 className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Your Translation</h3>
                            <InteractiveText text={userTranslation} highlights={result.highlights} showHighlights={showHighlights} />
                        </div>

                        {/* Better Translation */}
                        {result.better_translation && (
                            <div className="relative pl-4 border-l-4 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 py-2 rounded-r-xl">
                                <h3 className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Suggested Translation
                                </h3>
                                <p className="text-base text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">"{result.better_translation}"</p>
                            </div>
                        )}
                    </motion.div>

                    {/* B. Analysis & Feedback (Top Right) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
                    >
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <BarChart3 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Analysis</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-grow">
                            {result.feedback}
                        </p>
                    </motion.div>

                    {/* C. Strength (Bottom Left) */}
                    {result.strength && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100/50 dark:border-emerald-800/30"
                        >
                            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Strength
                            </h3>
                            <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium leading-relaxed">"{result.strength}"</p>
                        </motion.div>
                    )}

                    {/* D. Weakness (Bottom Middle) */}
                    {result.weakness && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="md:col-span-4 bg-rose-50/50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100/50 dark:border-rose-800/30"
                        >
                            <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <XCircleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Improvement
                            </h3>
                            <p className="text-sm text-rose-800 dark:text-rose-200 font-medium leading-relaxed">"{result.weakness}"</p>
                        </motion.div>
                    )}

                    {/* E. Vocabulary (Bottom Right) */}
                    {Array.isArray(result.vocabulary) && result.vocabulary.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-4 bg-violet-50/50 dark:bg-violet-900/20 rounded-2xl p-5 border border-violet-100/50 dark:border-violet-800/30"
                        >
                            <h3 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" /> Vocabulary
                            </h3>
                            <div className="space-y-2">
                                {result.vocabulary.slice(0, 3).map((vocab, idx) => (
                                    <div key={idx} className="flex flex-col bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg border border-violet-100/50 dark:border-violet-800/30">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm font-bold text-violet-900 dark:text-violet-200">{vocab.word}</span>
                                            <span className="text-[10px] text-violet-400 dark:text-violet-500 uppercase font-semibold">{vocab.type}</span>
                                        </div>
                                        <span className="text-xs text-violet-600 dark:text-violet-300 truncate">{vocab.translation}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
                {/* Token Usage Display - Detailed Breakdown */}
                <div className="text-center mt-8 pb-8">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">

                        {/* Question Cost */}
                        {location.state?.questionTokenUsage && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Question Cost</span>
                                <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{location.state.questionTokenUsage.total_tokens}</span> tokens
                                </span>
                            </div>
                        )}

                        {location.state?.questionTokenUsage && result.usage && (
                            <div className="hidden sm:block w-px h-8 bg-slate-300/50 dark:bg-slate-600/50"></div>
                        )}

                        {/* Evaluation Cost */}
                        {result.usage && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Evaluation Cost</span>
                                <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.usage.total_tokens}</span> tokens
                                </span>
                            </div>
                        )}

                        {(location.state?.questionTokenUsage || result.usage) && (
                            <div className="hidden sm:block w-px h-8 bg-slate-300/50 dark:bg-slate-600/50"></div>
                        )}

                        {/* Total Cost */}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-400 tracking-wider">Total Session</span>
                            <span className="text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300">
                                {((location.state?.questionTokenUsage?.total_tokens || 0) + (result.usage?.total_tokens || 0))} 💎
                            </span>
                        </div>

                    </div>
                    {result.usage && (
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                            Eval Detail: {result.usage.prompt_tokens} in + {result.usage.completion_tokens} out
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
