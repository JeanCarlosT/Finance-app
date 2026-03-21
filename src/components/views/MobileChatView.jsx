import React, { useState, useEffect, useRef } from 'react';
import SDUIEngine from '../sdui/SDUIEngine';

const API_URL = "https://script.google.com/macros/s/AKfycbx270L2FdDmTn_ftVfpb3AQeZGstquj3CqlXWgE1KYwBThh9hbV8BDUBf-wvTrZ_iNldA/exec";

const MobileChatView = ({ config, data }) => {
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', text: "Hola! I'm your financial assistant. What would you like to do today?" }
    ]);
    const [activeAction, setActiveAction] = useState(null); // e.g., "ADD_TRANSACTION"
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeAction]);

    const handleActionSelect = (actionType, label) => {
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: label }]);
        setActiveAction(actionType);
        setFormData({});
        
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                type: 'ai', 
                text: `Perfect. Please fill in the details for: ${label}` 
            }]);
        }, 500);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submitData = async () => {
        setIsSubmitting(true);
        try {
            // Map SDUI fields to API expected fields
            // The mapping depends on what exactly is in ui_config.mobile
            const payload = {
                action: activeAction,
                ...Object.keys(formData).reduce((acc, key) => {
                    // Convert keys to lowercase snake_case or whatever the API expects
                    const apiKey = key.toLowerCase().replace(/ /g, '_');
                    acc[apiKey] = formData[key];
                    return acc;
                }, {})
            };

            const response = await fetch(API_URL, {
                method: "POST",
                mode: "no-cors", // Crucial for GAS
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(payload)
            });

            // Since it's no-cors, we don't get a proper response, but we assume success if no error
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                type: 'ai', 
                text: "✅ Got it! I've saved that to your spreadsheet." 
            }]);
            setActiveAction(null);
            setFormData({});
        } catch (error) {
            console.error("Submission error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                type: 'ai', 
                text: "❌ Oops, something went wrong. Please try again." 
            }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="p-5 pt-8 bg-white border-b border-slate-100 shadow-sm z-10 rounded-b-[32px]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-bold text-lg">
                        F
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-tight">Fina AI</h1>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium ${
                            m.type === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}

                {/* SDUI Dynamic Form */}
                {activeAction && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 border-t-4 border-t-indigo-500">
                            <SDUIEngine 
                                config={config.filter(c => c.Action_Type === activeAction)} 
                                formData={formData}
                                onInputChange={handleInputChange}
                                isSubmitting={isSubmitting}
                            />
                            <button 
                                onClick={submitData}
                                disabled={isSubmitting}
                                className={`w-full mt-4 p-4 rounded-2xl font-bold transition-all shadow-lg ${
                                    isSubmitting 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                                }`}
                            >
                                {isSubmitting ? 'Syncing...' : 'Save Record'}
                            </button>
                            <button 
                                onClick={() => setActiveAction(null)}
                                className="w-full mt-2 text-xs font-bold text-slate-400 p-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Quick Actions / Input Area */}
            <footer className="p-6 bg-white border-t border-slate-100 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                {!activeAction ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {/* Unique Actions from UI Config */}
                        {[...new Set(config.map(item => item.Action_Type))].map(actionType => {
                            const actionInfo = config.find(c => c.Action_Type === actionType);
                            return (
                                <button
                                    key={actionType}
                                    onClick={() => handleActionSelect(actionType, actionInfo.Label)}
                                    className="whitespace-nowrap px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <span>{actionInfo.Icon || '⚡️'}</span>
                                    {actionInfo.Label}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Complete the form above</p>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default MobileChatView;
