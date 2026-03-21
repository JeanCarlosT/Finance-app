import React, { useState, useEffect } from 'react';
import useDeviceDetect from './hooks/useDeviceDetect';
import { fetchFinancialData } from './services/api';
import MobileChatView from './components/views/MobileChatView';
import MobileChatView from './components/views/MobileChatView';
import DesktopDashboardView from './components/views/DesktopDashboardView';

function App() {
  const { isMobile } = useDeviceDetect();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchFinancialData();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Connection error:", err);
        setError("Failed to connect with Google Sheets. Check your Web App URL in services/api.js");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-rose-50 p-8 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Sync Error</h2>
          <p className="text-slate-500 mb-6 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isMobile ? (
        <MobileChatView data={data} />
      ) : (
        <DesktopDashboardView data={data} />
      )}
    </div>
  );
}

export default App;
