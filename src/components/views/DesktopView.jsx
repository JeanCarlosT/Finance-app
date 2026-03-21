import React from 'react';

const DesktopView = ({ data }) => (
  <div className="min-h-screen flex items-center justify-center bg-indigo-600 text-white p-12 overflow-hidden relative">
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
    <div className="z-10 text-center">
      <h1 className="text-6xl font-black mb-4 tracking-tighter italic">Desktop Dashboard</h1>
      <p className="text-indigo-200 text-xl font-bold">Refined Version V2</p>
      <div className="mt-12 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">Live Backend Data</p>
        <div className="grid grid-cols-2 gap-8 text-left">
           <div>
             <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Transactions</p>
             <p className="text-3xl font-black">{data?.financial_data?.transactions?.length || 0}</p>
           </div>
           <div>
             <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Debts Master</p>
             <p className="text-3xl font-black">{data?.financial_data?.debts_master?.length || 0}</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

export default DesktopView;
