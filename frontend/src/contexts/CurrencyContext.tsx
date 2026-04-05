import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number; // 1 USD to INR
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem('currency') as Currency) || 'USD');
  const [exchangeRate, setExchangeRate] = useState<number>(83.50); // Default fallback

  const setCurrency = (c: Currency) => {
    localStorage.setItem('currency', c);
    setCurrencyState(c);
  };

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.INR) {
          setExchangeRate(data.rates.INR);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
      }
    };
    fetchRate();
  }, []);

  const formatAmount = (amount: number) => {
    if (currency === 'INR') {
      const inrValue = amount * exchangeRate;
      return `₹${inrValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
