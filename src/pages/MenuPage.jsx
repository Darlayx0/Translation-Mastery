import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Play, Clock, BookType, Hash, Type, ChevronDown, Check, Info, Sparkles, Search, X, Zap, AlignLeft, Globe, Type as TypeIcon, AlignJustify, FileText, Pilcrow, Baseline, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import SettingsModal from '../components/SettingsModal';
import { useTheme } from '../context/ThemeContext';

// --- Constants ---

const TOPICS = [
    "General", "Business", "Technology", "Travel", "Medical",
    "Legal", "Literature", "Science", "History", "Philosophy",
    "Art & Culture", "Politics", "Environment", "Fashion", "Sports",
    "Entertainment", "Cooking", "Psychology", "Economics", "Casual Chat",
    "Space & Astronomy", "Cryptocurrency", "Gaming", "Mythology", "Architecture",
    "Education", "Marketing", "Nutrition", "Parenting", "Real Estate"
].sort();

const STYLES = [
    "Standard", "Formal", "Casual", "Slang", "Academic",
    "Poetic", "Journalistic", "Persuasive", "Technical", "Humorous",
    "Sarcastic", "Archaic", "Modern", "Dramatic", "Minimalist",
    "Descriptive", "Narrative", "Imperative", "Interrogative", "Exclamatory",
    "Diplomatic", "Empathetic", "Motivational", "Satirical", "Horror/Spooky",
    "Romantic", "Sci-Fi", "Fantasy", "Mystery", "Historical"
].sort();

const DIFFICULTIES = [
    { value: "A1", level: "Beginner", color: "from-emerald-400 to-teal-400", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    { value: "A2", level: "Elementary", color: "from-teal-400 to-cyan-400", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
    { value: "B1", level: "Intermediate", color: "from-cyan-400 to-sky-400", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
    { value: "B2", level: "Upper Interm.", color: "from-sky-400 to-blue-400", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
    { value: "C1", level: "Advanced", color: "from-blue-400 to-indigo-400", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    { value: "C2", level: "Proficiency", color: "from-indigo-400 to-violet-400", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" }
];

const LENGTHS = [
    { label: "Single Word", icon: TypeIcon },
    { label: "Short Phrase", icon: Baseline },
    { label: "Simple Sentence", icon: AlignLeft },
    { label: "Complex Sentence", icon: AlignJustify },
    { label: "Short Paragraph", icon: FileText },
    { label: "Long Paragraph", icon: ScrollText }
];

// --- Components ---

const Combobox = ({ label, icon: Icon, value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 px-1">
                {Icon && <Icon className="w-4 h-4" />} {label}
            </label>
            <div className="relative group">
                <input
                    type="text"
                    value={isOpen ? searchTerm : value}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        setSearchTerm("");
                        setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:bg-white/80 dark:group-hover:bg-white/10"
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && filteredOptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/50 dark:border-white/10 max-h-60 overflow-y-auto p-1.5"
                    >
                        {filteredOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page ---

const MenuPage = () => {
    const navigate = useNavigate();
    const { playSFX } = useTheme(); // Use SFX
    const [config, setConfig] = useState({
        topic: 'General',
        style: 'Standard',
        difficulty: 'B1',
        length: 'Simple Sentence',
        duration: 0 // In seconds
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleStart = () => {
        playSFX('click');
        navigate('/practice', { state: { config } });
    };

    const formatDuration = (seconds) => {
        if (seconds === 0) return '∞';
        const m = Math.floor(seconds / 60);
        return `${m}m`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">

            {/* Ambient Background - Subtle & Professional */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-5xl bg-white/60 dark:bg-slate-950/30 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_-20px_rgba(0,0,0,0.6)] border border-white/40 dark:border-white/10 p-6 md:p-10 relative z-10 transition-all duration-500"
            >
                {/* Header Section - Mobile Optimized */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="p-3 md:p-3.5 bg-slate-900 dark:bg-indigo-600 rounded-2xl text-white shadow-xl shadow-slate-900/20 dark:shadow-indigo-500/30 ring-1 ring-white/10">
                            <Globe className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-sm">
                                Translation Mastery
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                                Professional AI-Powered Training
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setIsSettingsOpen(true); playSFX('click'); }}
                            className="p-3 md:p-3.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg hover:bg-white dark:hover:bg-white/10 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all backdrop-blur-sm"
                        >
                            <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </motion.button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                    {/* ROW 1: Difficulty (7 cols) + Length (5 cols) */}

                    {/* 1. Difficulty */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-7 flex flex-col gap-4"
                    >
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <BookType className="w-4 h-4" /> Proficiency Level
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
                            {DIFFICULTIES.map((level) => (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={level.value}
                                    onClick={() => { setConfig({ ...config, difficulty: level.value }); playSFX('click'); }}
                                    className={`relative p-3 md:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[100px] md:min-h-[110px] backdrop-blur-md ${config.difficulty === level.value
                                        ? `bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-900/10 dark:shadow-indigo-500/20 border-transparent ring-1 ring-white/10`
                                        : `bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20`
                                        }`}
                                >
                                    <span className="text-2xl md:text-3xl font-black tracking-tighter">{level.value}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.difficulty === level.value ? 'text-slate-400 dark:text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {level.level}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 2. Content Length */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-5 flex flex-col gap-4"
                    >
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <AlignLeft className="w-4 h-4" /> Content Volume
                        </label>
                        <div className="flex flex-col gap-2.5 h-full">
                            {LENGTHS.map((item) => (
                                <motion.button
                                    key={item.label}
                                    onClick={() => { setConfig({ ...config, length: item.label }); playSFX('click'); }}
                                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all border flex items-center justify-between backdrop-blur-sm ${config.length === item.label
                                        ? 'bg-white dark:bg-indigo-900/40 border-indigo-500/50 text-indigo-700 dark:text-indigo-300 shadow-lg dark:shadow-indigo-900/20 ring-1 ring-indigo-500/20'
                                        : 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-200 dark:hover:border-white/20 hover:text-indigo-600 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-4 h-4 ${config.length === item.label ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {config.length === item.label && <Check className="w-4 h-4" />}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ROW 2: Topic (4) + Style (4) + Timer (4) */}

                    {/* 3. Topic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-4"
                    >
                        <Combobox
                            label="Topic / Domain"
                            icon={Hash}
                            value={config.topic}
                            onChange={(val) => setConfig({ ...config, topic: val })}
                            options={TOPICS}
                            placeholder="e.g., Finance, Medical..."
                        />
                    </motion.div>

                    {/* 4. Style */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-4"
                    >
                        <Combobox
                            label="Tone & Style"
                            icon={Type}
                            value={config.style}
                            onChange={(val) => setConfig({ ...config, style: val })}
                            options={STYLES}
                            placeholder="e.g., Formal, Slang..."
                        />
                    </motion.div>

                    {/* 5. Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-4"
                    >
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 px-1">
                            <Clock className="w-4 h-4" /> Time Limit
                        </label>
                        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-center h-[96px] relative overflow-hidden transition-all hover:bg-white/80 dark:hover:bg-white/10 group">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight group-hover:scale-105 transition-transform origin-left">
                                    {formatDuration(config.duration)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1800"
                                step="30"
                                value={config.duration}
                                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200/50 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-slate-900 dark:accent-indigo-500 hover:accent-indigo-500 dark:hover:accent-indigo-400 transition-all"
                            />
                        </div>
                    </motion.div>

                    {/* 6. Start Button & Mode Selector in one block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-12 mt-6 flex flex-col md:flex-row gap-4 items-stretch"
                    >
                        {/* Mode Selector */}
                        <div className="flex-1 flex bg-white/50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm relative">
                            <button
                                onClick={() => { setConfig({ ...config, mode: 'classic' }); playSFX('click'); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all relative z-10 ${config.mode !== 'survival'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <BookType className="w-4 h-4" /> Classic
                            </button>
                            <button
                                onClick={() => { setConfig({ ...config, mode: 'survival', duration: 0 }); playSFX('click'); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all relative z-10 ${config.mode === 'survival'
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400'
                                    }`}
                            >
                                <Zap className="w-4 h-4" /> Survival
                            </button>
                        </div>

                        {/* Start Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleStart}
                            className={`flex-[2] p-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${config.mode === 'survival'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                                : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white shadow-slate-900/20 dark:shadow-indigo-600/30'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex flex-col items-start">
                                <h3 className="text-xl md:text-2xl font-black tracking-wide leading-none">
                                    {config.mode === 'survival' ? 'Start Survival' : 'Start Training'}
                                </h3>
                                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">
                                    {config.mode === 'survival' ? '500 HP • Scaling Difficulty' : 'Custom Config'}
                                </p>
                            </div>
                            <Play className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all fill-current" />
                        </motion.button>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

export default MenuPage;
