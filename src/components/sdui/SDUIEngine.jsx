import React from 'react';

const DynamicInput = ({ type, label, options, value, onChange }) => {
    const baseClass = "w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-slate-700 shadow-sm font-medium";

    switch (type) {
        case 'select':
            return (
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
                    <select 
                        className={baseClass}
                        onChange={(e) => onChange(e.target.value)}
                        value={value || ""}
                    >
                        <option value="">Select Category...</option>
                        {options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        case 'number':
            return (
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
                    <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        className={baseClass}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );
        case 'textfield':
        default:
            return (
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
                    <input 
                        type="text" 
                        placeholder={label}
                        className={baseClass}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );
    }
};

const SDUIEngine = ({ config, formData, onInputChange, isSubmitting }) => {
    if (!config || config.length === 0) return null;

    return (
        <div className="sdui-container space-y-4 max-w-md mx-auto">
            {config.map((item, index) => (
                <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 100}ms` }}>
                    <DynamicInput 
                        type={item.Input_Types} 
                        label={item.Label}
                        options={item.Category_Options} 
                        value={formData[item.Label]}
                        onChange={(val) => onInputChange(item.Label, val)}
                    />
                </div>
            ))}
        </div>
    );
};

export default SDUIEngine;
