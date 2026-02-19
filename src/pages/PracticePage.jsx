import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import TranslationInput from '../components/TranslationInput';
import { aiService } from '../services/AIService';
import { Clock, ArrowLeft, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useTheme } from '../context/ThemeContext';

const PracticePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { playSFX } = useTheme();
    const questionContainerRef = useRef(null);

    const config = useMemo(() => {
        return location.state?.config || { difficulty: 'Medium', length: 'Medium', duration: 0 };
    }, [location.state]);

    const isFocusMode = !!location.state?.focusContext;

    const [question, setQuestion] = useState("");
    const [translation, setTranslation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Timer State
    // If duration is 0 (Unlimited), start at 0 and count up.
    // If duration > 0, start at duration and count down.
    const [timeLeft, setTimeLeft] = useState(config.duration === 0 ? 0 : config.duration);

    // Timer should be active initially (unless stopped)
    const [isTimerActive, setIsTimerActive] = useState(true);

    const [tokenUsage, setTokenUsage] = useState(null);

    // Smart Keyboard Detection
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-scroll question to top when input is focused on mobile
    useEffect(() => {
        if (isMobile && isInputFocused && questionContainerRef.current) {
            // Small timeout to ensure layout has adjusted
            setTimeout(() => {
                questionContainerRef.current.scrollTop = 0;
            }, 100);
        }
    }, [isMobile, isInputFocused]);

    const fetchQuestion = useCallback(async () => {
        // Handle Retry Mode
        if (location.state?.retryMode && location.state?.question) {
            setQuestion(location.state.question);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setTranslation("");
        try {
            // Pass focusContext if available (Smart Retry Mode)
            const focusContext = location.state?.focusContext;

            // Survival Mode Difficulty Scaling
            let currentConfig = { ...config };
            if (config.mode === 'survival') {
                const DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"];
                const survivalState = location.state?.survivalState || { questionsAnswered: 0, hp: 300 };

                // Find base index from config
                const baseIndex = DIFFICULTIES.indexOf(config.difficulty) !== -1 ? DIFFICULTIES.indexOf(config.difficulty) : 0;
                // Calculate level ups based on answered questions
                const levelsGained = Math.floor(survivalState.questionsAnswered / 5);
                // Current difficulty is base + gained, capped at C2 (index 5)
                const currentIndex = Math.min(baseIndex + levelsGained, 5);

                currentConfig.difficulty = DIFFICULTIES[currentIndex];
            }

            const data = await aiService.generateQuestion({ ...currentConfig, focusContext });

            if (!data.question) {
                throw new Error("Gagal memuat soal (Respon kosong).");
            }

            setQuestion(data.question);
            if (data.usage) setTokenUsage(data.usage);
        } catch (err) {
            setError(err.message || "Gagal membuat soal. Periksa koneksi internet atu Kunci API Anda.");
            playSFX('error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [config, location.state, playSFX]);

    const submitTranslation = useCallback(async (autoSubmit = false) => {
        if (!question) return;

        setLoading(true);
        setError(null);
        setIsTimerActive(false); // Stop timer

        try {
            const resultData = await aiService.evaluateTranslation(question, translation);
            playSFX('success'); // Play success sound before navigating (or maybe 'click'?)
            // Navigate to results page with data
            navigate('/result', {
                state: {
                    result: resultData,
                    config: config,
                    question: question,
                    userTranslation: translation,
                    isTimeUp: autoSubmit,
                    questionTokenUsage: tokenUsage,
                    survivalState: location.state?.survivalState || { hp: 300, questionsAnswered: 0, totalScore: 0, history: [] } // Default for new survival session starts at 300
                }
            });
        } catch (err) {
            setError("Gagal mengevaluasi terjemahan.");
            playSFX('error');
            console.error(err);
            setIsTimerActive(true); // Resume timer if failed
        } finally {
            setLoading(false);
            // Reset focus to ensure UI restores if we stay (though usually we navigate)
            setIsInputFocused(false);
        }
    }, [question, translation, config, navigate, tokenUsage, playSFX]);

    // Initial Question Load
    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isTimerActive) {
            interval = setInterval(() => {
                if (config.duration === 0) {
                    // Unlimited Mode: Count UP
                    setTimeLeft((prev) => prev + 1);
                } else {
                    // Limited Mode: Count DOWN
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            submitTranslation(true); // Auto submit when time hits 0
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, config.duration, submitTranslation]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Visual Viewport Handling for Mobile Keyboard
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            setViewportHeight(window.visualViewport.height);
        };

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);
        handleResize();

        return () => {
            window.visualViewport.removeEventListener('resize', handleResize);
            window.visualViewport.removeEventListener('scroll', handleResize);
        };
    }, []);


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300"
        >
            {/* Top Navigation Bar - Absolute Top */}
            <div className="absolute top-0 left-0 right-0 z-30 px-2 py-2 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm transition-colors border-b border-white/5 dark:border-white/5">
                <button
                    onClick={() => { playSFX('click'); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-medium text-sm border border-white/20 dark:border-white/10 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Kembali</span>
                </button>

                {isFocusMode && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-700/50 shadow-sm">
                        <Zap className="w-3 h-3 fill-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wide">Fokus Perbaikan</span>
                    </div>
                )}

                {/* Smart Mobile Header Action - Icon Only */}
                {isMobile && isInputFocused && (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => { playSFX('click'); submitTranslation(false); }}
                        disabled={!translation.trim() || loading}
                        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 bg-slate-900 dark:bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/40 z-50 disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-5 h-5" />}
                    </motion.button>
                )}

                {/* Timer Display (Always Show) */}
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono font-bold text-lg transition-colors border shadow-sm backdrop-blur-md ${config.duration > 0 && timeLeft < 60
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {error && (
                <div className="absolute top-16 left-0 right-0 z-40 px-4">
                    <div className="bg-red-50/80 dark:bg-red-900/80 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in backdrop-blur-sm">
                        <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* LAYER 1: Main Content (Card) - Full Height */}
            {/* This layer sits behind the keyboard on mobile */}
            <div className="absolute inset-0 flex flex-col pt-16 pb-0 lg:pt-20 lg:static lg:h-full lg:flex-row gap-4 lg:gap-6 lg:p-6 overflow-hidden">

                {/* Content Wrapper - Fixed Height (Card manages internal scroll) */}
                <div ref={questionContainerRef} className="w-full h-[50vh] lg:w-5/12 lg:h-full flex flex-col order-1 p-4 lg:p-0 mx-auto justify-center relative">

                    {/* SURVIVAL HUD */}
                    {config.mode === 'survival' && (
                        <div className="absolute top-0 left-0 right-0 -mt-12 lg:-mt-16 px-4 flex items-center gap-3 z-20">
                            {/* HP Bar */}
                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700 relative">
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${Math.max(0, Math.min(100, (location.state?.survivalState?.hp || 300) / 300 * 100))}%` }}
                                    className={`h-full transition-all duration-500 ${(location.state?.survivalState?.hp || 300) > 150 ? 'bg-emerald-500' :
                                        (location.state?.survivalState?.hp || 300) > 75 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                                        }`}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                                <Zap className="w-3 h-3 text-red-500 fill-red-500" />
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums">
                                    {location.state?.survivalState?.hp || 300}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Stage</span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                    {Math.floor((location.state?.survivalState?.questionsAnswered || 0) / 5) + 1}
                                </span>
                            </div>
                        </div>
                    )}

                    <ExerciseCard
                        question={question}
                        onNewQuestion={() => { playSFX('click'); fetchQuestion(); }}
                        loading={loading}
                    />
                    {tokenUsage && (
                        <div className="mt-2 ml-1 text-xs text-slate-400 dark:text-slate-500 font-mono font-medium opacity-80 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-100 dark:border-slate-700 w-fit">
                            Tokens: {tokenUsage.total_tokens}
                        </div>
                    )}
                </div>

                {/* Desktop: Right Side Placeholder (Input moved to fixed layer for mobile) */}
                <div className="hidden lg:flex w-full lg:w-7/12 h-full flex-col order-2">
                    <div className="w-full max-w-5xl mx-auto h-full pt-10 lg:pt-0"> {/* Added padding top for Survival HUD space */}
                        <TranslationInput
                            translation={translation}
                            setTranslation={setTranslation}
                            onCheck={() => submitTranslation(false)}
                            loading={loading}
                            disabled={!question || loading}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                        />
                    </div>
                </div>
            </div>

            {/* LAYER 2: Floating Input (Mobile Only) */}
            {/* Pins to the top of the virtual keyboard */}
            <div
                className="lg:hidden fixed left-0 right-0 z-[60]"
                style={{
                    top: isMobile ? `${viewportHeight}px` : 'auto',
                    bottom: isMobile ? 'auto' : 0,
                    transform: isMobile ? 'translateY(-100%)' : 'none'
                }}
            >
                <div className={`p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ${isInputFocused ? 'bg-white dark:bg-slate-900 border-none shadow-none pb-2' : ''}`}>
                    <TranslationInput
                        translation={translation}
                        setTranslation={setTranslation}
                        onCheck={() => submitTranslation(false)}
                        loading={loading}
                        disabled={!question || loading}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        minimalMode={isInputFocused} // Compact ONLY when focused
                    />
                </div>
            </div>

        </motion.div>
    );
};

export default PracticePage;
