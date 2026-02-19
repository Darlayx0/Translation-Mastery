import React, { useState, useEffect } from 'react';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { aiService } from '../services/AIService';

const ApiKeyModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedKey = aiService.getApiKey();
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isValid = await aiService.validateApiKey(apiKey);
            if (isValid) {
                aiService.setApiKey(apiKey);
                onClose();
            } else {
                setError('Kunci API tidak valid. Silakan periksa kembali.');
            }
        } catch {
            setError('Gagal memvalidasi Kunci API.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-full">
                        <Key className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Masukkan Kunci API</h2>
                </div>

                <p className="text-gray-600 mb-6">
                    Untuk menggunakan aplikasi ini, Anda memerlukan Kunci API (Groq/OpenAI Compatible). Kunci Anda disimpan secara lokal di browser.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                            Kunci API
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            placeholder="gsk_..."
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={loading || !apiKey}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Simpan Kunci'
                            )}
                        </button>

                        <a
                            href="https://console.groq.com/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Dapatkan Kunci API Gratis (Groq) →
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyModal;
