import React, { useState, useEffect, useRef } from 'react';
import { postData } from '../../services/api';

const MobileChatView = ({ data }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Welcome back! What do you want to register today?' }]);
  const [currentFlow, setCurrentFlow] = useState(null); // This will now store the full config item
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Helper to generate dynamic steps for the selected action
  const getFlowSteps = (configItem) => {
    if (!configItem) return [];

    if (configItem.Action_Type === 'ADD_TRANSACTION') {
      // Parse categories from the sheet format ["Cat1", "Cat2"] or Cat1, Cat2
      let categories = configItem.Category_Options || [];
      if (typeof categories === 'string') {
        categories = categories.replace(/[\[\]"]/g, "").split(',').map(s => s.trim()).filter(Boolean);
      }
      
      return [
        { key: 'concept', label: 'Concept', type: 'textfield', prompt: `What is the concept for ${configItem.Label}?` },
        { key: 'amount', label: 'Amount', type: 'number', prompt: 'How much?' },
        { key: 'category', label: 'Category', type: 'select', options: categories, prompt: 'Select a category:' }
      ];
    } 
    
    if (configItem.Action_Type === 'ADD_DEBT') {
      return [
        { key: 'concept', label: 'Debt Concept', type: 'textfield', prompt: 'Name of the debt (e.g. Credit Card):' },
        { key: 'installment', label: 'Installment Amount', type: 'number', prompt: 'How much is the monthly fee?' },
        { key: 'total', label: 'Total Amount', type: 'number', prompt: 'What is the total initial debt?' },
        { key: 'entity', label: 'Entity', type: 'textfield', prompt: 'Who is the lender? (Bank/Person):' },
        { key: 'day', label: 'Payment Day', type: 'number', prompt: 'On which day of the month is it paid? (1-31):' }
      ];
    }
    
    if (configItem.Action_Type === 'ADD_SAVING_GOAL') {
      return [
        { key: 'concept', label: 'Goal Name', type: 'textfield', prompt: 'What is the name of this saving goal?' },
        { key: 'target', label: 'Target Amount', type: 'number', prompt: 'How much do you want to save in total?' }
      ];
    }
    
    return [];
  };

  const steps = getFlowSteps(currentFlow);

  const startFlow = (configItem) => {
    const flowSteps = getFlowSteps(configItem);
    if (flowSteps.length === 0) return;

    setCurrentFlow(configItem);
    setStepIndex(0);
    // Determine transaction type from Label if it's ADD_TRANSACTION
    const type = configItem.Label?.toLowerCase().includes('income') ? 'Income' : 'Expense';
    setFormData(configItem.Action_Type === 'ADD_TRANSACTION' ? { type } : {});
    
    setMessages(prev => [...prev, 
      { sender: 'user', text: `${configItem.Icon || '⚡️'} Start ${configItem.Label}` },
      { sender: 'bot', text: flowSteps[0].prompt }
    ]);
  };

  const handleNextStep = async (explicitValue = null) => {
    const valueToUse = explicitValue !== null ? explicitValue : inputValue;
    if (!valueToUse && steps[stepIndex].type !== 'select') return;

    const currentStep = steps[stepIndex];
    const newFormData = { ...formData, [currentStep.key]: valueToUse };
    setFormData(newFormData);
    
    setMessages(prev => [...prev, { sender: 'user', text: valueToUse }]);
    setInputValue('');

    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      setStepIndex(nextIndex);
      setMessages(prev => [...prev, { sender: 'bot', text: steps[nextIndex].prompt }]);
    } else {
      await submitFlow(newFormData);
    }
  };

  const submitFlow = async (finalData) => {
    setIsSaving(true);
    setMessages(prev => [...prev, { sender: 'bot', text: 'Syncing with your vault...' }]);
    
    try {
      const sanitizedData = {};
      const actionType = currentFlow.Action_Type;
      
      if (actionType === 'ADD_TRANSACTION') {
        sanitizedData.type = finalData.type || 'Expense';
        sanitizedData.concept = (finalData.concept || '').trim();
        sanitizedData.amount = parseFloat(finalData.amount) || 0;
        sanitizedData.category = finalData.category || 'Other';
      } else if (actionType === 'ADD_DEBT') {
        sanitizedData.concept = (finalData.concept || '').trim();
        sanitizedData.installment = parseFloat(finalData.installment) || 0;
        sanitizedData.total = parseFloat(finalData.total) || 0;
        sanitizedData.entity = (finalData.entity || '').trim();
        sanitizedData.day = parseInt(finalData.day) || 1;
      } else if (actionType === 'ADD_SAVING_GOAL') {
        sanitizedData.concept = (finalData.concept || '').trim();
        sanitizedData.target = parseFloat(finalData.target) || 0;
      }

      const payload = {
        action: actionType,
        ...sanitizedData
      };

      console.group(`💎 [V3 - ${actionType} PAYLOAD]`);
      console.log("JSON to Send:", JSON.stringify(payload, null, 2));
      console.groupEnd();

      await postData(payload);
      
      setMessages(prev => [...prev, { sender: 'bot', text: '✅ Success! Data encrypted and saved.' }]);
      setTimeout(() => {
        setCurrentFlow(null);
        setStepIndex(0);
        setFormData({});
        setMessages(prev => [...prev, { sender: 'bot', text: 'What else can I help you with?' }]);
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setMessages(prev => [...prev, { sender: 'bot', text: '❌ Error: Could not reach the server.' }]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      <header className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center font-black italic">F</div>
           <span className="font-black tracking-tighter italic">FINA.</span>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
          Live Sync
        </div>
      </header>

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

      <footer className="p-6 bg-slate-800/50 border-t border-white/5 backdrop-blur-2xl">
        {!currentFlow ? (
          <div className="grid grid-cols-2 gap-3">
             {data?.ui_config?.map(item => (
                <button 
                  key={item.Label}
                  onClick={() => startFlow(item)} 
                  className={`p-4 rounded-2xl font-black text-xs uppercase transition-all active:scale-95 flex items-center justify-center gap-2
                    ${item.Action_Type === 'ADD_TRANSACTION' 
                      ? (item.Label.toLowerCase().includes('income') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400')
                      : 'col-span-2 bg-indigo-500 text-white shadow-xl shadow-indigo-500/20'}`}
                >
                  <span className="text-lg">{item.Icon}</span>
                  {item.Label}
                </button>
             ))}
          </div>
        ) : (
          <div className="space-y-4">
             {steps[stepIndex]?.type === 'select' ? (
                <div className="grid grid-cols-2 gap-2">
                  {steps[stepIndex].options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleNextStep(opt)} 
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
             ) : (
                <div className="relative">
                  <input 
                    type={steps[stepIndex]?.type === 'number' ? 'number' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Enter ${steps[stepIndex]?.label || 'value'}...`}
                    className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleNextStep()}
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
