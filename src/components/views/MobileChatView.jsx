import React, { useState, useEffect, useRef } from 'react';
import { postData } from '../../services/api';

const FLOWS = {
  ADD_TRANSACTION: [
    { key: 'concept', label: 'Concept', type: 'textfield', prompt: 'What did you spend on? (Description)' },
    { key: 'amount', label: 'Amount', type: 'number', prompt: 'How much?' },
    { key: 'category', label: 'Category', type: 'select', options: ['Food', 'Rent', 'Transport', 'Personal', 'Other'], prompt: 'Select a category:' }
  ],
  ADD_DEBT: [
    { key: 'concept', label: 'Debt Concept', type: 'textfield', prompt: 'Name of the debt (e.g. Credit Card):' },
    { key: 'installment', label: 'Installment Amount', type: 'number', prompt: 'How much is the monthly fee?' },
    { key: 'total', label: 'Total Amount', type: 'number', prompt: 'What is the total initial debt?' },
    { key: 'entity', label: 'Entity', type: 'textfield', prompt: 'Who is the lender? (Bank/Person):' },
    { key: 'day', label: 'Payment Day', type: 'number', prompt: 'On which day of the month is it paid? (1-31):' }
  ]
};

const MobileChatView = ({ data }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Welcome back! What do you want to register today?' }]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startFlow = (flowType) => {
    const type = flowType === 'Income' || flowType === 'Expense' ? 'ADD_TRANSACTION' : 'ADD_DEBT';
    setCurrentFlow(type);
    setStepIndex(0);
    setFormData(type === 'ADD_TRANSACTION' ? { type: flowType } : {});
    setMessages(prev => [...prev, 
      { sender: 'user', text: `Start ${flowType}` },
      { sender: 'bot', text: FLOWS[type][0].prompt }
    ]);
  };

  const handleNextStep = async () => {
    if (!inputValue && FLOWS[currentFlow][stepIndex].type !== 'select') return;

    const currentStep = FLOWS[currentFlow][stepIndex];
    const newFormData = { ...formData, [currentStep.key]: inputValue };
    setFormData(newFormData);
    
    setMessages(prev => [...prev, { sender: 'user', text: inputValue }]);
    setInputValue('');

    const nextIndex = stepIndex + 1;
    if (nextIndex < FLOWS[currentFlow].length) {
      setStepIndex(nextIndex);
      setMessages(prev => [...prev, { sender: 'bot', text: FLOWS[currentFlow][nextIndex].prompt }]);
    } else {
      // Flow Complete
      await submitFlow(newFormData);
    }
  };

  const submitFlow = async (finalData) => {
    setIsSaving(true);
    setMessages(prev => [...prev, { sender: 'bot', text: 'Syncing with your vault...' }]);
    
    try {
      // 1. Sanitize and Format data for the specific action
      const sanitizedData = {};
      
      if (currentFlow === 'ADD_TRANSACTION') {
        sanitizedData.type = finalData.type || 'Expense';
        sanitizedData.concept = (finalData.concept || '').trim();
        sanitizedData.amount = parseFloat(finalData.amount) || 0;
        sanitizedData.category = finalData.category || 'Other';
      } else if (currentFlow === 'ADD_DEBT') {
        sanitizedData.concept = (finalData.concept || '').trim();
        sanitizedData.installment = parseFloat(finalData.installment) || 0;
        sanitizedData.total = parseFloat(finalData.total) || 0;
        sanitizedData.entity = (finalData.entity || '').trim();
        sanitizedData.day = parseInt(finalData.day) || 1;
      }

      const payload = {
        action: currentFlow,
        ...sanitizedData
      };

      console.log("🚀 Submitting to GAS:", payload);
      await postData(payload);
      
      setMessages(prev => [...prev, { sender: 'bot', text: '✅ Success! Data encrypted and saved to your cloud.' }]);
      setTimeout(() => {
        setCurrentFlow(null);
        setStepIndex(0);
        setFormData({});
        setMessages(prev => [...prev, { sender: 'bot', text: 'What else can I help you with?' }]);
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setMessages(prev => [...prev, { sender: 'bot', text: '❌ Error: Could not reach the server. Try again later.' }]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center font-black italic">F</div>
           <span className="font-black tracking-tighter italic">FINA.</span>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
          Live Sync
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed font-sans
              ${m.sender === 'bot' 
                ? 'bg-slate-800 text-slate-200 rounded-tl-sm shadow-xl' 
                : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isSaving && (
           <div className="flex justify-start">
             <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-sm flex gap-2">
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-slate-800/50 border-t border-white/5 backdrop-blur-2xl">
        {!currentFlow ? (
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => startFlow('Income')} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-xs uppercase transition-all active:scale-95">Add Income</button>
             <button onClick={() => startFlow('Expense')} className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-xs uppercase transition-all active:scale-95">Add Expense</button>
             <button onClick={() => startFlow('Debt')} className="col-span-2 p-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Add New Master Debt</button>
          </div>
        ) : (
          <div className="space-y-4">
             {FLOWS[currentFlow][stepIndex].type === 'select' ? (
                <div className="grid grid-cols-2 gap-2">
                  {FLOWS[currentFlow][stepIndex].options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setInputValue(opt); setTimeout(handleNextStep, 100); }} 
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
             ) : (
                <div className="relative">
                  <input 
                    type={FLOWS[currentFlow][stepIndex].type === 'number' ? 'number' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Enter ${FLOWS[currentFlow][stepIndex].label}...`}
                    className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
                    autoFocus
                  />
                  <button 
                    onClick={handleNextStep}
                    className="absolute right-3 top-3 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
                  >
                    →
                  </button>
                </div>
             )}
             <button 
              onClick={() => { setCurrentFlow(null); setMessages(prev => [...prev, {sender: 'bot', text: 'Canceled. What else?'}]) }}
              className="w-full text-[10px] font-black uppercase text-slate-500 py-2"
             >
               Cancel Action
             </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default MobileChatView;
