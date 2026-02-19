import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MenuPage from './pages/MenuPage';
import PracticePage from './pages/PracticePage';
import ResultPage from './pages/ResultPage';
import { aiService } from './services/AIService';
import { ThemeProvider } from './context/ThemeContext';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');

  useEffect(() => {
    const checkApiKey = () => {
      const key = aiService.getApiKey();
      if (!key) {
        setSettingsTab('api');
        setIsSettingsOpen(true);
      }
    };
    checkApiKey();
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            defaultTab={settingsTab}
          />

          <Layout>
            {/* We pass setIsSettingsOpen to Layout/MenuPage via Context or Props if needed, 
                but actually MenuPage uses internal state for its own settings button? 
                Wait, MenuPage currently renders its OWN ApiKeyModal. 
                We should centralized this or let pages manage it. 
                The layout might need to know about settings? 
                Actually, MenuPage has its own settings button. 
                Let's allow App to handle the global "Force API Key" modal, 
                and MenuPage can handle its own "User clicked Settings" modal?
                Or better, provide a context for UI control? 
                Simpler: Just let App handle the initial check. 
                MenuPage will instantiate its own SettingsModal for user interaction. 
            */}
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
