import React, { createContext, useContext, useState, useEffect } from 'react';
import { StandardType } from '../features/calc/types';
import { historyStorage } from '../features/history/storage';

interface AppContextType {
  standard: StandardType;
  setStandard: (s: StandardType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [standard, setStandard] = useState<StandardType>('ShenBian');
  
  useEffect(() => {
    historyStorage.init().catch(console.error);
  }, []);

  return (
    <AppContext.Provider value={{ standard, setStandard }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
