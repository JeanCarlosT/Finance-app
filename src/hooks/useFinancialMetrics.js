import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics and budget adherence.
 * Rules: 50-30-20 based on Total Income.
 */
const useFinancialMetrics = (data, filteredTransactions) => {
  const allTransactions = data?.financial_data?.transactions || [];
  const debts = data?.financial_data?.debts_master || [];
  const savingsGoals = data?.financial_data?.savings_goals || [];

  return useMemo(() => {
    // 1. Calculations for Totals (ONLY SELECTED PERIOD)
    const txForTotals = filteredTransactions || [];
    const totalIncome = txForTotals
      .filter(t => {
        const type = (t.Type || t.type || t.transaction || '');
        return type === 'Income';
      })
      .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);

    const totalExpenses = txForTotals
      .filter(t => {
        const type = (t.Type || t.type || t.transaction || '');
        return type === 'Expense';
      })
      .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);

    // Get dynamic mapping from GAS - Normalize to lowercase keys for robust lookup
    const rawMapping = data?.financial_data?.budget_mapping || {};
    const mapping = {};
    Object.keys(rawMapping).forEach(key => {
      mapping[key.toLowerCase()] = rawMapping[key];
    });

    // Savings in THIS period
    const totalSavings = txForTotals
      .filter(t => {
        const catName = String(t.Category || t.category || '').toLowerCase();
        return (mapping[catName] || '').toLowerCase() === 'savings';
      })
      .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);

    const currentBalance = totalIncome - (totalExpenses);

    // 2. Budget (ONLY SELECTED PERIOD)
    const budget = {
      needs: { label: 'Needs (50%)', limit: totalIncome * 0.5, actual: 0, color: 'bg-indigo-500' },
      wants: { label: 'Wants (30%)', limit: totalIncome * 0.3, actual: 0, color: 'bg-amber-500' },
      savings: { label: 'Savings & Debt (20%)', limit: totalIncome * 0.2, actual: 0, color: 'bg-emerald-500' }
    };

    txForTotals.forEach(t => {
      const type = (t.Type || t.type || t.transaction || '');
      if (type === 'Expense') {
        const catName = String(t.Category || t.category || 'Other').toLowerCase();
        const amt = Number(t.Amount || t.amount || 0);
        const group = (mapping[catName] || 'Wants').toLowerCase();
        
        if (group === 'needs') budget.needs.actual += amt;
        else if (group === 'wants') budget.wants.actual += amt;
        else if (group === 'savings' || group === 'debt') budget.savings.actual += amt;
        else budget.wants.actual += amt;
      }
    });

    // 3. Debt Progress (ALL TIME)
    const processedDebts = debts.map(debt => {
      const debtConcept = String(debt.Concept || debt.concept || '');
      const totalPaid = allTransactions
        .filter(t => {
          const cat = String(t.Category || t.category || '').toLowerCase();
          const concept = String(t.Concept || t.concept || '');
          const group = (mapping[cat] || '').toLowerCase();
          return group === 'debt' && concept.toLowerCase().includes(debtConcept.toLowerCase());
        })
        .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);
      
      const total = Number(debt.Total_Amount || debt.total_amount || 0);
      const remaining = total - totalPaid;
      const progress = total > 0 ? (totalPaid / total) * 100 : 0;

      return {
        ...debt,
        Concept: debtConcept,
        paid: totalPaid,
        remaining: remaining > 0 ? remaining : 0,
        progress: progress > 100 ? 100 : Number(progress.toFixed(1))
      };
    });

    // 4. Savings Goals Progress (ALL TIME)
    const processedSavings = savingsGoals.map(goal => {
      const goalConcept = String(goal.Concept || goal.concept || '');
      
      const savedAmount = allTransactions
        .filter(t => {
          const cat = String(t.Category || t.category || '').toLowerCase();
          const concept = String(t.Concept || t.concept || '');
          const group = (mapping[cat] || '').toLowerCase();
          return group === 'savings' && concept.toLowerCase().includes(goalConcept.toLowerCase());
        })
        .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);
      
      const target = Number(goal.Target_Amount || goal.target_amount || 0);
      const progress = target > 0 ? (savedAmount / target) * 100 : 0;

      return {
        ...goal,
        Concept: goalConcept,
        saved: savedAmount,
        target: target,
        progress: progress > 100 ? 100 : Number(progress.toFixed(1))
      };
    });

    return {
      totalIncome,
      totalExpenses: totalExpenses - totalSavings,
      totalSavings,
      currentBalance,
      budget,
      processedDebts,
      processedSavings
    };
  }, [allTransactions, filteredTransactions, debts, savingsGoals, data?.financial_data?.budget_mapping]);
};

export default useFinancialMetrics;
