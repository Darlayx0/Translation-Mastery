import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden flex flex-col items-center transition-colors duration-300">
            {/* Ambient Moving Background - Nebula Effect */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-teal-200/30 to-emerald-200/30 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-[120px] opacity-60 dark:opacity-40 will-change-transform"
                />
                <motion.div
                    animate={{
                        x: [0, -70, 70, 0],
                        y: [0, 70, -70, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-gradient-to-tl from-indigo-200/30 to-blue-200/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-[120px] opacity-60 dark:opacity-40 will-change-transform"
                />
                <motion.div
                    animate={{
                        x: [0, 30, -30, 0],
                        y: [0, 30, -30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[40%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-violet-200/20 dark:bg-fuchsia-600/15 rounded-full blur-[100px] opacity-40 dark:opacity-30 will-change-transform"
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 flex-grow flex flex-col">


                <main className="relative flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="pt-8 text-center text-slate-400 text-sm font-medium pb-4">
                    <p>Powered by <span className="text-indigo-500 font-bold">Cerebras</span> & <span className="text-blue-500 font-bold">OpenAI</span> • OSS 120B Model</p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
