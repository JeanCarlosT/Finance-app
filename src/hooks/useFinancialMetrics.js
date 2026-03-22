import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics and budget adherence.
 * Rules: 50-30-10-10 based on Total Income.
 */
const useFinancialMetrics = (data) => {
  const transactions = data?.financial_data?.transactions || [];
  const debts = data?.financial_data?.debts_master || [];

  return useMemo(() => {
    console.log("🧮 [METRICS CALCULATION START]", { 
      receivedCount: transactions.length,
      sample: transactions[0] 
    });

    // 1. Calculations for Totals
    const totalIncome = transactions
      .filter(t => {
        const type = (t.Type || t.type || t.transaction || '');
        const isIncome = type === 'Income';
        return isIncome;
      })
      .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => {
        const type = (t.Type || t.type || t.transaction || '');
        const isExpense = type === 'Expense';
        return isExpense;
      })
      .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);

    console.log(`Calculated: Income=$${totalIncome}, Expenses=$${totalExpenses}`);

    const currentBalance = totalIncome - totalExpenses;

    // 2. Budget 50/30/20 Rule
    const budget = {
      needs: { label: 'Needs (50%)', limit: totalIncome * 0.5, actual: 0, color: 'bg-indigo-500' },
      wants: { label: 'Wants (30%)', limit: totalIncome * 0.3, actual: 0, color: 'bg-amber-500' },
      savings: { label: 'Savings & Debt (20%)', limit: totalIncome * 0.2, actual: 0, color: 'bg-emerald-500' }
    };

    // Get dynamic mapping from GAS if available
    const mapping = data?.financial_data?.budget_mapping || {};

    transactions.forEach(t => {
      const type = (t.Type || t.type || t.transaction || '');
      if (type === 'Expense') {
        const catName = t.Category || t.category || 'Other';
        const amt = Number(t.Amount || t.amount || 0);

        // Map to group based on the dynamic mapping sheet
        const group = (mapping[catName] || 'Wants').toLowerCase();

        if (group === 'needs') budget.needs.actual += amt;
        else if (group === 'wants') budget.wants.actual += amt;
        else if (group === 'savings' || group === 'debt') budget.savings.actual += amt;
        else budget.wants.actual += amt; // Default to Wants if not categorized
      }
    });

    // 3. Debt Progress
    const processedDebts = debts.map(debt => {
      // Find payments related to this specific debt name in transactions
      const debtConcept = debt.Concept || debt.concept || '';
      const totalPaid = transactions
        .filter(t => {
          const cat = t.Category || t.category || '';
          const concept = t.Concept || t.concept || '';
          return cat === 'Debt Payment' && concept.includes(debtConcept);
        })
        .reduce((sum, t) => sum + Number(t.Amount || t.amount || 0), 0);
      
      const total = Number(debt.Total_Amount || debt.total_amount || 0);
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
