import { useState, useMemo } from 'react';

/**
 * Hook to manage bi-weekly (fortnightly) filtering logic.
 * 1st Fortnight: Days 1-15
 * 2nd Fortnight: Days 16-End of month
 */
const useFortnightFilter = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const fortnightInfo = useMemo(() => {
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const isFirst = day <= 15;

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const label = `${isFirst ? '1ra' : '2da'} ${monthNames[month]}`;

    // Calculate ranges for actual filtering
    const startDate = new Date(year, month, isFirst ? 1 : 16);
    const endDate = isFirst 
      ? new Date(year, month, 15, 23, 59, 59) 
      : new Date(year, month + 1, 0, 23, 59, 59);

    return { label, isFirst, month, year, startDate, endDate };
  }, [currentDate]);

  const nextFortnight = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (d.getDate() <= 15) {
        d.setDate(16);
      } else {
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
      }
      return d;
    });
  };

  const prevFortnight = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (d.getDate() > 15) {
        d.setDate(1);
      } else {
        d.setMonth(d.getMonth() - 1);
        d.setDate(16);
      }
      return d;
    });
  };

  const filterData = (transactions) => {
    if (!transactions) return [];
    const { startDate, endDate } = fortnightInfo;
    
    return transactions.filter((t) => {
      const txDate = t.Date || t.date;
      if (!txDate) return false;
      
      const tDate = new Date(txDate);
      return tDate >= startDate && tDate <= endDate;
    });
  };

  return {
    ...fortnightInfo,
    nextFortnight,
    prevFortnight,
    filterData
  };
};

export default useFortnightFilter;
