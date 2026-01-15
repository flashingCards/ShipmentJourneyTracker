'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { JourneyMode, JourneyConfig } from '@/lib/types';

const defaultJourneyConfig: JourneyConfig = {
  10: [
    { node: "Pickup", days: 1 },
    { node: "Flight-out", days: 3 },
    { node: "Landed", days: 2 },
    { node: "Cleared at DC", days: 2 },
    { node: "Injection", days: 1 },
    { node: "Delivery", days: 1 },
  ],
  12: [
    { node: "Pickup", days: 2 },
    { node: "Flight-out", days: 3 },
    { node: "Landed", days: 2 },
    { node: "Cleared at DC", days: 2 },
    { node: "Injection", days: 2 },
    { node: "Delivery", days: 1 },
  ],
  15: [
    { node: "Pickup", days: 2 },
    { node: "Flight-out", days: 4 },
    { node: "Landed", days: 3 },
    { node: "Cleared at DC", days: 3 },
    { node: "Injection", days: 2 },
    { node: "Delivery", days: 1 },
  ],
};


interface AppContextType {
  journeyConfig: JourneyConfig;
  setJourneyConfig: React.Dispatch<React.SetStateAction<JourneyConfig>>;
  activeJourneyMode: JourneyMode;
  setActiveJourneyMode: React.Dispatch<React.SetStateAction<JourneyMode>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [journeyConfig, setJourneyConfig] = useState<JourneyConfig>(defaultJourneyConfig);
  const [activeJourneyMode, setActiveJourneyMode] = useState<JourneyMode>(10);

  return (
    <AppContext.Provider
      value={{
        journeyConfig,
        setJourneyConfig,
        activeJourneyMode,
        setActiveJourneyMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
