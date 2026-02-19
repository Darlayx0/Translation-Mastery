import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Clock, AlertCircle, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TOTAL_ROUNDS = 5;
const NUMBERS_PER_ROUND = 10;

const DIFFICULTIES = {
    1: { botTime: 15 }, // ~1.5s per number
    2: { botTime: 12 }, // ~1.2s per number
    3: { botTime: 9 },  // ~0.9s per number
    4: { botTime: 7 },  // ~0.7s per number
    5: { botTime: 5 },  // ~0.5s per number
};

const generatePositions = () => {
    const positions = [];
    const minDistance = 15; // Minimum distance %

    for (let i = 1; i <= NUMBERS_PER_ROUND; i++) {
        let attempts = 0;
        let pos;
        let valid = false;

        while (!valid && attempts < 100) {
            pos = {
                top: Math.random() * 80 + 10, // 10% to 90%
                left: Math.random() * 80 + 10, // 10% to 90%
                id: i
            };

            valid = true;
            for (let j = 0; j < positions.length; j++) {
                const dy = pos.top - positions[j].top;
                const dx = pos.left - positions[j].left;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }
        positions.push(pos);
    }
    // Shuffle the array so drawing order doesn't reveal sequence
    return positions.sort(() => Math.random() - 0.5);
};

const ReflexGamePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { playSFX } = useTheme();

    const config = location.state || { mode: 'benchmark', difficulty: 3 };
    const { mode, difficulty } = config;

    const [round, setRound] = useState(1);
    const [gameState, setGameState] = useState('countdown'); // countdown, playing, roundEnd, finished
    const [countdown, setCountdown] = useState(3);

    const [expectedNumber, setExpectedNumber] = useState(1);
    const [positions, setPositions] = useState([]);

    // Timing
    const [startTime, setStartTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const timerRef = useRef(null);

    const [roundTimes, setRoundTimes] = useState([]);

    // Bot tracking
    const [botProgress, setBotProgress] = useState(0);
    const botIntervalRef = useRef(null);

    // Initialize Round
    useEffect(() => {
        if (gameState === 'countdown') {
            setExpectedNumber(1);
            setPositions(generatePositions());

            const countInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countInterval);
                        setGameState('playing');
                        setStartTime(Date.now());
                        playSFX('success'); // Beep
                        return 0;
                    }
                    playSFX('click');
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countInterval);
        }
    }, [gameState, round, playSFX]);

    // Timer and Bot Logic
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setCurrentTime(Date.now() - startTime);
            }, 10);

            if (mode === 'versus') {
                const totalBotMs = DIFFICULTIES[difficulty].botTime * 1000;
                const updateIntervalMs = 50;
                const progressPerUpdate = (updateIntervalMs / totalBotMs) * 100;

                botIntervalRef.current = setInterval(() => {
                    setBotProgress(prev => {
                        const next = prev + progressPerUpdate;
                        // If bot reaches 100%, bot wins the round
                        if (next >= 100) {
                            clearInterval(botIntervalRef.current);
                            handleRoundEnd(totalBotMs, true);
                            return 100;
                        }
                        return next;
                    });
                }, updateIntervalMs);
            }

            return () => {
                clearInterval(timerRef.current);
                clearInterval(botIntervalRef.current);
            };
        }
    }, [gameState, startTime, mode, difficulty]);

    const handleNumberClick = (id) => {
        if (gameState !== 'playing') return;

        if (id === expectedNumber) {
            playSFX('click');
            if (expectedNumber === NUMBERS_PER_ROUND) {
                // Round Complete by Player
                handleRoundEnd(Date.now() - startTime, false);
            } else {
                setExpectedNumber(prev => prev + 1);
            }
        } else {
            // Wrong number clicked - optional penalty
            playSFX('error');
        }
    };

    const handleRoundEnd = (timeTakenMs, botWon) => {
        clearInterval(timerRef.current);
        clearInterval(botIntervalRef.current);
        setGameState('roundEnd');

        // Save time
        setRoundTimes(prev => [...prev, {
            round,
            time: timeTakenMs,
            botWon
        }]);
    };

    const handleNextPhase = () => {
        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1);
            setCountdown(3);
            setGameState('countdown');
            setCurrentTime(0);
            setBotProgress(0);
        } else {
            // Finish Game
            playSFX('success');
            navigate('/reflex/result', {
                state: {
                    config,
                    roundTimes
                }
            });
        }
    };

    const formatTime = (ms) => {
        return (ms / 1000).toFixed(3);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">

            {/* Header / HUD */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-20">
                <button
                    onClick={() => { playSFX('click'); navigate('/reflex'); }}
                    className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm text-slate-500 hover:text-rose-500 transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="px-6 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm backdrop-blur-md font-bold text-slate-700 dark:text-slate-300 text-sm tracking-widest uppercase mb-2">
                        Round {round} / {TOTAL_ROUNDS}
                    </div>

                    <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter drop-shadow-sm flex items-center gap-2">
                        <Clock className="w-6 h-6 text-rose-500" />
                        {formatTime(currentTime)}s
                    </div>
                </div>

                <div className="w-12" /> {/* Spacer for symmetry */}
            </div>

            {/* Next Number Indicator */}
            {gameState === 'playing' && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg z-20 animate-pulse">
                    Next: <span className="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center">{expectedNumber}</span>
                </div>
            )}

            {/* Versus Bot Progress Bar */}
            {mode === 'versus' && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-20">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl shadow-lg backdrop-blur-md w-full">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider">
                                <Bot className="w-4 h-4" /> BOT (Level {difficulty})
                            </div>
                            <div className="text-xs font-bold text-slate-400">
                                {Math.min(100, botProgress).toFixed(0)}%
                            </div>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all duration-75 ease-linear"
                                style={{ width: `${botProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Game Board */}
            <div className="relative w-full max-w-4xl h-[60vh] md:h-[70vh] bg-white/40 dark:bg-slate-800/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[2rem] shadow-inner overflow-hidden">

                <AnimatePresence>
                    {gameState === 'countdown' && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="absolute inset-0 flex items-center justify-center z-30"
                        >
                            <div className="text-9xl font-black text-rose-500 drop-shadow-2xl">
                                {countdown > 0 ? countdown : 'GO!'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {gameState !== 'countdown' && positions.map((pos) => {
                    const isClicked = pos.id < expectedNumber;
                    const isNext = pos.id === expectedNumber;

                    if (isClicked) return null; // Hide clicked numbers

                    return (
                        <button
                            key={pos.id}
                            onClick={() => handleNumberClick(pos.id)}
                            className={`absolute w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all duration-200 shadow-xl border-4 ${isNext
                                    ? 'bg-rose-500 text-white border-white scale-110 shadow-rose-500/50 z-10 hover:scale-125'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-600 hover:scale-110 opacity-90'
                                }`}
                            style={{
                                top: `${pos.top}%`,
                                left: `${pos.left}%`,
                                transform: `translate(-50%, -50%) ${isNext ? 'scale(1.1)' : 'scale(1)'}`
                            }}
                        >
                            {pos.id}
                        </button>
                    );
                })}

                {/* Round End Overlay */}
                <AnimatePresence>
                    {gameState === 'roundEnd' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-200 dark:border-slate-800"
                            >
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    Round {round} Complete!
                                </h3>

                                {mode === 'versus' && (
                                    <div className={`text-lg font-bold mb-4 ${roundTimes[round - 1]?.botWon ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {roundTimes[round - 1]?.botWon ? 'Bot Won This Round' : 'You Beat The Bot!'}
                                    </div>
                                )}

                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Your Time</div>
                                <div className="text-4xl font-black text-rose-500 tabular-nums">
                                    {formatTime(currentTime)}s
                                </div>

                                <button
                                    onClick={handleNextPhase}
                                    className="mt-8 w-full p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    {round < TOTAL_ROUNDS ? 'Next Round' : 'View Results'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default ReflexGamePage;
