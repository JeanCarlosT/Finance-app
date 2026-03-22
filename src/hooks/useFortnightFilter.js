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
    
    console.log(`--- Filtering ${transactions.length} transactions for range: ${startDate.toISOString()} to ${endDate.toISOString()} ---`);

    return transactions.filter((t, index) => {
      const txDate = t.Date || t.date;
      if (!txDate) {
        if (index === 0) console.warn("First transaction missing date field:", t);
        return false;
      }
      
      const tDate = new Date(txDate);
      const isMatch = tDate >= startDate && tDate <= endDate;
      
      // Log some samples to verify formats
      if (index < 3) {
        console.log(`Sample ${index}: ${txDate} -> Parsed: ${tDate.toISOString()} -> Match: ${isMatch}`);
      }
      
      return isMatch;
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
