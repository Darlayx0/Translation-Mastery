import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // --- Dark Mode State ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    // Apply Theme Effect
    useEffect(() => {
        const root = window.document.documentElement;

        const removeOldTheme = () => {
            root.classList.remove('dark');
            root.classList.remove('light');
        };

        const applyTheme = (targetTheme) => {
            removeOldTheme();
            if (targetTheme === 'dark') {
                root.classList.add('dark');
            } else if (targetTheme === 'light') {
                root.classList.add('light'); // Optional, usually default
            } else {
                // System
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                }
            }
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);


    // --- Audio State ---
    const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('volume') || '0.5'));

    useEffect(() => {
        localStorage.setItem('soundEnabled', soundEnabled);
        localStorage.setItem('volume', volume);
    }, [soundEnabled, volume]);

    // Sound Assets (Using simple hosted MP3s or Data URIs would be better but for now let's mock or use placeholder urls)
    // For a real production app we'd import these. I'll use some placeholder generic feedback sounds.
    // Actually, to ensure it works without external dependencies failing, let's use a robust method.
    // I will use some standard UI sounds via URL.
    // Base64 Audio Assets for reliability and instant playback
    const sounds = {
        // User asked for "variation". I will use a different set of high-quality UI sounds.

        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Pop click
        success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success chime
        error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Error buzzer
        toggle: 'https://assets.mixkit.co/active_storage/sfx/2596/2596-preview.mp3', // Switch click
        hover: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Soft tick
    };

    const playSFX = (type) => {
        if (!soundEnabled) return;

        const src = sounds[type];
        if (!src) return;

        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(e => console.error("Audio play failed", e));
    };

    return (
        <ThemeContext.Provider value={{
            theme, setTheme,
            soundEnabled, setSoundEnabled,
            volume, setVolume,
            playSFX
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
