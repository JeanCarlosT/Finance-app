import React from 'react';
import useFinancialMetrics from '../../hooks/useFinancialMetrics';
import useBiWeeklyAlerts from '../../hooks/useBiWeeklyAlerts';
import BiWeeklyAlerts from '../dashboard/BiWeeklyAlerts';

/**
 * Sub-Component: Summary Stat Card
 */
const SummaryCard = ({ title, amount, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
      <h3 className={`text-3xl font-black tracking-tighter ${colorClass}`}>${amount.toLocaleString()}</h3>
    </div>
    <p className="text-[10px] font-bold text-gray-400 mt-4 italic">{subtitle}</p>
  </div>
);

/**
 * Sub-Component: Budget Progress Bar
 */
const BudgetBar = ({ label, actual, limit, color }) => {
  const percentage = limit > 0 ? (actual / limit) * 100 : 0;
  const isOver = percentage > 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
        <span className="text-gray-600">{label}</span>
        <span className={isOver ? 'text-rose-500' : 'text-gray-400'}>
          ${actual.toLocaleString()} / <span className="text-gray-300">${limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isOver ? 'bg-rose-500' : color} transition-all duration-1000`} 
          style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Component: Desktop Dashboard View
 */
const DesktopDashboardView = ({ data }) => {
  const { totalIncome, totalExpenses, currentBalance, budget, processedDebts } = useFinancialMetrics(data);
  const filteredAlerts = useBiWeeklyAlerts(data?.financial_data?.debts_master);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic text-slate-900">Dashboard.</h1>
            <p className="text-slate-400 font-bold text-sm tracking-tight mt-1">Smart Financial Intelligence V2</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Sync Active</span>
            </div>
          </div>
        </header>

        {/* Alerts Section */}
        <BiWeeklyAlerts debts={filteredAlerts} />

        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SummaryCard 
            title="Current Balance" 
            amount={currentBalance} 
            colorClass="text-indigo-600"
            subtitle="Net worth across your ecosystem"
          />
          <SummaryCard 
            title="Total Income" 
            amount={totalIncome} 
            colorClass="text-emerald-500"
            subtitle="All cash inflows this period"
          />
          <SummaryCard 
            title="Total Expenses" 
            amount={totalExpenses} 
            colorClass="text-rose-500"
            subtitle="Spending and debt servicing"
          />
        </section>

        {/* Middle Content: Budget Tracker */}
        <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tight italic">Budget Adherence (50-30-10-10)</h2>
            <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">Ideal Strategy</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
            <BudgetBar {...budget.needs} />
            <BudgetBar {...budget.wants} />
            <BudgetBar {...budget.savings} />
            <BudgetBar {...budget.lifestyle} />
          </div>
        </section>

        {/* Bottom Content: Debts Table */}
        <section className="bg-white overflow-hidden rounded-[48px] shadow-sm border border-gray-100">
          <div className="p-10 pb-4">
            <h2 className="text-2xl font-black tracking-tight italic">Debt Master Protocol</h2>
            <p className="text-slate-400 text-xs font-bold mt-1">Reconciliation with live transaction history</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-10 py-6">Concept</th>
                  <th className="px-6 py-6">Entity</th>
                  <th className="px-6 py-6">Installment</th>
                  <th className="px-6 py-6">Remaining</th>
                  <th className="px-6 py-6">Progress</th>
                  <th className="px-10 py-6 text-right">Payment Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {processedDebts.length > 0 ? processedDebts.map((debt, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6 font-black text-sm">{debt.Concept}</td>
                    <td className="px-6 py-6 text-xs font-bold text-gray-500">{debt.Entity}</td>
                    <td className="px-6 py-6 text-sm font-black text-indigo-600">${Number(debt.Installment_Amount).toLocaleString()}</td>
                    <td className="px-6 py-6 text-sm font-black">${debt.remaining.toLocaleString()}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${debt.progress}%` }}></div>
                         </div>
                         <span className="text-[10px] font-black text-gray-400">{debt.progress}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right font-black text-xs text-gray-400">Day {debt.Payment_Day_of_Month}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-10 py-20 text-center text-gray-300 font-bold italic">No active debts found in system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DesktopDashboardView;
