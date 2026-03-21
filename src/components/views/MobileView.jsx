import React from 'react';

const MobileView = ({ data }) => (
  <div className="h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
    <div>
      <h1 className="text-2xl font-black mb-2 italic tracking-tighter">Mobile View</h1>
      <p className="text-slate-400 font-medium">Refined Chat Experience V2 coming soon...</p>
      <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
         <p className="text-sm font-black text-indigo-600">Successfully connected to GAS API</p>
      </div>
    </div>
  </div>
);

export default MobileView;
