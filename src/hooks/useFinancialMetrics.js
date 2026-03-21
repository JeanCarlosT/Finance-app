import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics and budget adherence.
 * Rules: 50-30-10-10 based on Total Income.
 */
const useFinancialMetrics = (data) => {
  const transactions = data?.financial_data?.transactions || [];
  const debts = data?.financial_data?.debts_master || [];

  return useMemo(() => {
    // 1. Calculations for Totals
    const totalIncome = transactions
      .filter(t => t.Type === 'Income')
      .reduce((sum, t) => sum + Number(t.Amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.Type === 'Expense')
      .reduce((sum, t) => sum + Number(t.Amount || 0), 0);

    const currentBalance = totalIncome - totalExpenses;

    // 2. Budget 50-30-10-10 Ideal vs Actual
    // We categorize based on typical financial categories
    const budget = {
      needs: { label: 'Essentials (50%)', limit: totalIncome * 0.5, actual: 0, color: 'bg-indigo-500' },
      wants: { label: 'Wants (30%)', limit: totalIncome * 0.3, actual: 0, color: 'bg-amber-500' },
      savings: { label: 'Savings (10%)', limit: totalIncome * 0.1, actual: 0, color: 'bg-emerald-500' },
      lifestyle: { label: 'Personal (10%)', limit: totalIncome * 0.1, actual: 0, color: 'bg-rose-500' }
    };

    transactions.forEach(t => {
      if (t.Type === 'Expense') {
        const cat = t.Category?.toLowerCase();
        const amt = Number(t.Amount || 0);
        if (['rent', 'services', 'food', 'fixed', 'debt payment'].includes(cat)) budget.needs.actual += amt;
        else if (['transport', 'subscriptions', 'entertainment'].includes(cat)) budget.wants.actual += amt;
        else if (['savings', 'investment'].includes(cat)) budget.savings.actual += amt;
        else budget.lifestyle.actual += amt;
      }
    });

    // 3. Debt Reconciliation
    const processedDebts = debts.map(debt => {
      // Find payments related to this specific debt name in transactions
      const totalPaid = transactions
        .filter(t => t.Category === 'Debt Payment' && (t.Concept || '').includes(debt.Concept))
        .reduce((sum, t) => sum + Number(t.Amount || 0), 0);
      
      const total = Number(debt.Total_Amount || 0);
      const remaining = total - totalPaid;
      const progress = total > 0 ? (totalPaid / total) * 100 : 0;

      return {
        ...debt,
        paid: totalPaid,
        remaining: remaining > 0 ? remaining : 0,
        progress: progress > 100 ? 100 : progress.toFixed(1)
      };
    });

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      budget,
      processedDebts
    };
  }, [transactions, debts]);
};

export default useFinancialMetrics;
