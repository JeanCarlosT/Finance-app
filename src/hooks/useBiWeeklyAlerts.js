import { useMemo } from 'react';

/**
 * Hook to filter debts based on the current fortnight (bi-weekly alerts).
 * Logic: Days 1-15 (1st fortnight), Days 16-31 (2nd fortnight).
 */
const useBiWeeklyAlerts = (debtsMaster) => {
  return useMemo(() => {
    const today = new Date().getDate();
    const isFirstFortnight = today <= 15;

    return (debtsMaster || []).filter(debt => {
      const dueDay = Number(debt.Payment_Day_of_Month || 0);
      return isFirstFortnight ? dueDay <= 15 : dueDay > 15;
    });
  }, [debtsMaster]);
};

export default useBiWeeklyAlerts;
