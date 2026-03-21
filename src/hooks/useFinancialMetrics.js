import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics based on rule 50-30-10-10
 * and debt progression.
 */
const useFinancialMetrics = (transactions = [], debts = []) => {
    return useMemo(() => {
        // 1. Total Income (Current Month)
        const totalIncome = transactions
            .filter(t => t.Type === 'Income')
            .reduce((acc, t) => acc + Number(t.Amount), 0);

        // 2. Budget Rules (50-30-10-10)
        const budgetLimits = {
            essentials: totalIncome * 0.50,
            wants: totalIncome * 0.30,
            savings: totalIncome * 0.10,
            personal: totalIncome * 0.10
        };

        // 3. Real Spending by Category Groups
        const realSpending = {
            essentials: transactions.filter(t => t.Category?.includes('Responsabilidades')).reduce((acc, t) => acc + Number(t.Amount), 0),
            wants: transactions.filter(t => t.Category?.includes('Gastos')).reduce((acc, t) => acc + Number(t.Amount), 0),
            savings: transactions.filter(t => t.Category?.includes('Ahorros')).reduce((acc, t) => acc + Number(t.Amount), 0),
            personal: transactions.filter(t => t.Category?.includes('Personal')).reduce((acc, t) => acc + Number(t.Amount), 0)
        };

        // 4. Debt Progression
        const debtProgress = debts.map(debt => {
            const paidToThisDebt = transactions
                .filter(t => t.Debt_ID === debt.ID && (t.Type === 'Debt Payment' || t.Category?.includes('Deuda')))
                .reduce((acc, t) => acc + Number(t.Amount), 0);
            
            const remaining = Number(debt.Total_Amount) - paidToThisDebt;
            const percentage = (paidToThisDebt / Number(debt.Total_Amount)) * 100;

            return {
                ...debt,
                paid: paidToThisDebt,
                remaining: remaining > 0 ? remaining : 0,
                percentage: percentage > 100 ? 100 : percentage
            };
        });

        // 5. Bi-Weekly Logic
        const today = new Date();
        const currentDay = today.getDate();
        const isFirstFortnight = currentDay <= 15;
        
        // Filter debts/responsibilities due in the current fortnight
        const currentAlerts = debts.filter(d => {
            const dueDate = new Date(d.Due_Date);
            const dueDay = dueDate.getDate();
            if (isFirstFortnight) {
                return dueDay <= 15;
            } else {
                return dueDay > 15;
            }
        });

        return {
            totalIncome,
            budgetLimits,
            realSpending,
            debtProgress,
            fortnight: isFirstFortnight ? 'First Fortnight (1-15)' : 'Second Fortnight (16-End)',
            currentAlerts
        };
    }, [transactions, debts]);
};

export default useFinancialMetrics;
