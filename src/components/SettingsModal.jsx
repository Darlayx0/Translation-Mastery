import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Volume2, VolumeX, Key, Check, ChevronRight, Laptop, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/AIService';

const ToggleSwitch = ({ checked, onChange, icon: Icon, activeColor = 'bg-indigo-500' }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${checked ? activeColor : 'bg-slate-200 dark:bg-slate-700'}`}
    >
        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${checked ? 'translate-x-6' : 'translate-x-0'}`}>
            {Icon && <Icon className={`w-3.5 h-3.5 ${checked ? 'text-indigo-600' : 'text-slate-400'}`} />}
        </div>
    </button>
);

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, setTheme, soundEnabled, setSoundEnabled, volume, setVolume, playSFX } = useTheme();
    const [view, setView] = useState('main'); // 'main' or 'api'
    const [apiKey, setApiKey] = useState('');
    const [apiError, setApiError] = useState('');
    const [apiLoading, setApiLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setView('main');
            const key = aiService.getApiKey();
            if (key) setApiKey(key);
        }
    }, [isOpen]);

    const handleSaveKey = async (e) => {
        e.preventDefault();
        setApiLoading(true);
        setApiError('');
        try {
            const isValid = await aiService.validateApiKey(apiKey);
            if (isValid) {
                aiService.setApiKey(apiKey);
                playSFX('success');
                setView('main'); // Go back to main settings
            } else {
                setApiError('Invalid API Key');
                playSFX('error');
            }
        } catch {
            setApiError('Validation Failed');
            playSFX('error');
        } finally {
            setApiLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {view === 'main' ? 'Settings' : 'API Configuration'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <AnimatePresence mode="wait">
                        {view === 'main' ? (
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Appearance Control */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                            {theme === 'dark' ? <Moon className="w-5 h-5" /> : (theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Appearance</h3>
                                            <p className="text-xs text-slate-500 font-medium">Select your preferred theme</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1">
                                        {[
                                            { id: 'light', icon: Sun, label: 'Light' },
                                            { id: 'dark', icon: Moon, label: 'Dark' },
                                            { id: 'system', icon: Monitor, label: 'Auto' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setTheme(opt.id); playSFX('click'); }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${theme === opt.id
                                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                <opt.icon className="w-3.5 h-3.5" />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sound Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-600 dark:text-pink-400">
                                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Sound Effects</h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {soundEnabled ? 'Enabled' : 'Muted'}
                                            </p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={soundEnabled}
                                        onChange={(checked) => {
                                            setSoundEnabled(checked);
                                            playSFX('toggle');
                                        }}
                                        activeColor="bg-pink-500"
                                        icon={soundEnabled ? Volume2 : VolumeX}
                                    />
                                </div>

                                {/* Volume Slider */}
                                {soundEnabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800/50"
                                    >
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            <span>Volume</span>
                                            <span>{Math.round(volume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </motion.div>
                                )}

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                                {/* API Key Button */}
                                <button
                                    onClick={() => { setView('api'); playSFX('click'); }}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">API Key</h3>
                                            <p className="text-xs text-slate-500">Configure AI access</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="api"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                        Your API key is stored securely in your browser's local storage. We never transmit it to our servers.
                                    </p>
                                </div>

                                <form onSubmit={handleSaveKey} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Groq/OpenAI Key</label>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-mono text-sm dark:text-white"
                                            placeholder="sk-..."
                                            autoFocus
                                        />
                                    </div>

                                    {apiError && (
                                        <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {apiError}
                                        </p>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setView('main'); playSFX('click'); }}
                                            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={apiLoading || !apiKey}
                                            className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            {apiLoading ? 'Verifying...' : 'Save Key'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
