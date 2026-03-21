import React, { useState, useEffect } from 'react';
import useDeviceDetect from './hooks/useDeviceDetect';
import MobileChatView from './components/views/MobileChatView';
import DesktopDashboardView from './components/views/DesktopDashboardView';

function App() {
    const { isMobile } = useDeviceDetect();
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = "https://script.google.com/macros/s/AKfycbx270L2FdDmTn_ftVfpb3AQeZGstquj3CqlXWgE1KYwBThh9hbV8BDUBf-wvTrZ_iNldA/exec";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch data");
                const json = await response.json();
                setAppData(json);
            } catch (err) {
                console.error("Error fetching SDUI Config:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">F</div>
                </div>
                <p className="mt-4 text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Initializing Fina...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-red-100 border border-red-100 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
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

    const { ui_config, financial_data } = appData;

    return (
        <div className="app-container">
            {isMobile ? (
                <MobileChatView 
                    config={ui_config?.mobile || []} 
                    data={financial_data} 
                />
            ) : (
                <DesktopDashboardView 
                    config={ui_config?.desktop || []} 
                    data={financial_data} 
                />
            )}
        </div>
    );
}

export default App;
