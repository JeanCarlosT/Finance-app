import React from 'react';
import useFinancialMetrics from '../../hooks/useFinancialMetrics';

const MetricCard = ({ title, limit, real, color }) => {
    const percentage = Math.round((real / limit) * 100) || 0;
    const isExceeded = real > limit;

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-48">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isExceeded ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {percentage}%
                    </span>
                </div>
                <p className="text-2xl font-black text-slate-800">${real.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-medium">Budget: ${limit.toFixed(2)}</p>
            </div>
            
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${color}`} 
                    style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
                />
            </div>
        </div>
    );
};

const DesktopDashboardView = ({ data }) => {
    const { 
        totalIncome, 
        budgetLimits, 
        realSpending, 
        debtProgress, 
        fortnight, 
        currentAlerts 
    } = useFinancialMetrics(data?.transactions, data?.financial_data?.debts);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 font-black text-2xl">
                        F
                    </div>
                    <span className="font-black text-2xl tracking-tighter italic">PersonalFinance.</span>
                </div>

                <nav className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">
                        <span>📊</span> Dashboard
                    </div>
                    <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all cursor-pointer">
                        <span>📜</span> History
                    </div>
                    <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all cursor-pointer">
                        <span>🗺️</span> Predictions
                    </div>
                </nav>

                <div className="bg-slate-900 p-6 rounded-[32px] text-white">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Monthly Income</p>
                    <h3 className="text-2xl font-black">${totalIncome.toFixed(2)}</h3>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase text-indigo-400">
                        <span>Ready to plan</span>
                        <span>⚡️</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Financial Summary</h2>
                        <p className="text-slate-400 font-medium">Tracking your budget via Rule 50-30-10-10</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{fortnight}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <MetricCard title="Essentials (50%)" limit={budgetLimits.essentials} real={realSpending.essentials} color="bg-indigo-600" />
                    <MetricCard title="Wants (30%)" limit={budgetLimits.wants} real={realSpending.wants} color="bg-amber-500" />
                    <MetricCard title="Savings (10%)" limit={budgetLimits.savings} real={realSpending.savings} color="bg-emerald-500" />
                    <MetricCard title="Personal (10%)" limit={budgetLimits.personal} real={realSpending.personal} color="bg-rose-500" />
                </div>

                <div className="grid grid-cols-12 gap-10">
                    {/* Debt Section */}
                    <div className="col-span-8">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span>💳</span> Master Debt Progress
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {debtProgress.map((debt, i) => (
                                <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg">{debt.Name}</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total: ${debt.Total_Amount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-indigo-600">${debt.remaining.toFixed(0)}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Remaining</p>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden mb-2">
                                        <div 
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-100" 
                                            style={{ width: `${debt.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center font-black text-slate-400 italic">
                                        {Math.round(debt.percentage)}% Paid off
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts / Timeline */}
                    <div className="col-span-4">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span>🔔</span> Fortnight Alerts
                        </h3>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                            {currentAlerts.length > 0 ? (
                                <div className="space-y-6">
                                    {currentAlerts.map((alert, i) => (
                                        <div key={i} className="flex gap-4 items-center group">
                                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center font-bold text-xs ring-2 ring-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                {new Date(alert.Due_Date).getDate()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 leading-tight">{alert.Name}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Due this Fortnight</p>
                                            </div>
                                            <div className="ml-auto text-sm font-black text-rose-500">
                                                Quincena
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-4">✨</div>
                                    <p className="text-sm font-bold text-slate-400 leading-relaxed">Everything is on track for this fortnight!</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 border-dashed">
                             <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">💡 Wealth Pro-Tip</h4>
                             <p className="text-xs text-indigo-600/70 font-medium leading-relaxed">
                                Always pay your high-interest debts first. The 10% savings rule is your safety net!
                             </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DesktopDashboardView;
