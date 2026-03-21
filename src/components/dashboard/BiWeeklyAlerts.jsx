import React from 'react';

const BiWeeklyAlerts = ({ debts }) => {
  if (!debts || debts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl animate-bounce">🔔</div>
        <div>
          <h3 className="text-lg font-black text-amber-900 tracking-tight italic">Bi-Weekly Payment Alerts</h3>
          <p className="text-amber-700 text-[10px] font-bold uppercase tracking-widest">Upcoming Obligations This Fortnight</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debts.map((debt, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-amber-200 flex justify-between items-center group hover:scale-[1.02] transition-all">
            <div>
              <p className="text-xs font-black text-slate-800">{debt.Concept}</p>
              <p className="text-[10px] font-bold text-slate-400">{debt.Entity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-rose-500">${Number(debt.Installment_Amount).toLocaleString()}</p>
              <p className="text-[10px] font-black text-amber-500">Day {debt.Payment_Day_of_Month}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiWeeklyAlerts;
