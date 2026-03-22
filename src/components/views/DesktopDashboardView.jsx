import React, { useMemo } from 'react';
import useFinancialMetrics from '../../hooks/useFinancialMetrics';
import useBiWeeklyAlerts from '../../hooks/useBiWeeklyAlerts';
import useFortnightFilter from '../../hooks/useFortnightFilter'; // <--- NUEVO
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
  // --- Lógica de Filtrado Quincenal ---
  const { label, nextFortnight, prevFortnight, filterData, startDate, endDate } = useFortnightFilter();
  
  const filteredTransactions = useMemo(() => {
    return filterData(data?.financial_data?.transactions);
  }, [data, filterData]);

  // Re-empaquetamos los datos para useFinancialMetrics
  const filteredData = useMemo(() => ({
    ...data,
    financial_data: {
      ...data?.financial_data,
      transactions: filteredTransactions
    }
  }), [data, filteredTransactions]);
  const { totalIncome, totalExpenses, totalSavings, currentBalance, budget, processedDebts, processedSavings } = useFinancialMetrics(data, filteredTransactions);
  const filteredAlerts = useBiWeeklyAlerts(data?.financial_data?.debts_master);
  
  // Tab State
  const [activeTab, setActiveTab] = React.useState('debts');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic text-slate-900">Dashboard.</h1>
            <p className="text-slate-400 font-bold text-sm tracking-tight mt-1">Smart Financial Intelligence V2</p>
          </div>

          {/* Selector de Quincena */}
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
             <button 
              onClick={prevFortnight} 
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-slate-400 font-black"
             >
               ←
             </button>
             <div className="px-4 min-w-[140px] text-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 block">Periodo Actual</span>
               <span className="text-sm font-black text-slate-800 tracking-tight">{label}</span>
             </div>
             <button 
              onClick={nextFortnight}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-slate-400 font-black"
             >
               →
             </button>
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
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <SummaryCard 
            title="Total Savings" 
            amount={totalSavings} 
            colorClass="text-amber-500"
            subtitle="Set aside for your goals"
          />
        </section>

        {/* Middle Content: Budget Tracker */}
        <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tight italic">Budget Adherence (50-30-20)</h2>
            <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">Strategy Approved</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
            <BudgetBar {...budget.needs} />
            <BudgetBar {...budget.wants} />
            <BudgetBar {...budget.savings} />
          </div>
        </section>

        {/* Bottom Section: Debts & Savings Selector */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
              <button 
                onClick={() => setActiveTab('debts')}
                className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'debts' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                DEBT MASTER
              </button>
              <button 
                onClick={() => setActiveTab('savings')}
                className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'savings' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                SAVINGS PROSPERITY
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
              {activeTab === 'debts' ? 'Reconciliation with live history' : 'Your path to financial freedom'}
            </p>
          </div>

          <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Concept</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">{activeTab === 'debts' ? 'Entity' : 'Saved'}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">{activeTab === 'debts' ? 'Installment' : 'Target'}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">{activeTab === 'debts' ? 'Remaining' : 'Pending'}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Progress</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">{activeTab === 'debts' ? 'Payment Day' : 'Priority'}</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'debts' ? (
                  processedDebts.length > 0 ? processedDebts.map((debt, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-6 font-black text-sm tracking-tight">{debt.Concept}</td>
                      <td className="px-10 py-6 text-xs font-bold text-gray-400">{debt.Entity || 'Direct'}</td>
                      <td className="px-10 py-6 font-black text-indigo-600 text-xs">${debt.Installment_Amount || 0}</td>
                      <td className="px-10 py-6 font-black text-slate-800 text-xs">${debt.remaining.toLocaleString()}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 min-w-[120px]">
                           <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${debt.progress}%` }}></div>
                           </div>
                           <span className="text-[10px] font-black text-gray-400">{debt.progress}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-xs text-gray-400">Day {debt.Payment_Day_of_Month}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-10 py-20 text-center text-gray-300 font-bold italic">No active debts found.</td></tr>
                  )
                ) : (
                  processedSavings.length > 0 ? processedSavings.map((goal, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-6 font-black text-sm tracking-tight">{goal.Concept}</td>
                      <td className="px-10 py-6 text-xs font-bold text-emerald-500">${goal.saved.toLocaleString()}</td>
                      <td className="px-10 py-6 font-black text-gray-400 text-xs">${goal.target.toLocaleString()}</td>
                      <td className="px-10 py-6 font-black text-slate-800 text-xs">${(goal.target - goal.saved).toLocaleString()}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 min-w-[120px]">
                           <div className="flex-1 h-2 bg-emerald-50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${goal.progress}%` }}></div>
                           </div>
                           <span className="text-[10px] font-black text-gray-400">{goal.progress}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-xs text-amber-500">Savings Mode</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-10 py-20 text-center text-gray-300 font-bold italic">No savings goals defined yet.</td></tr>
                  )
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
