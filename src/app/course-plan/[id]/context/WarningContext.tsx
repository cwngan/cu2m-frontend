import React, { createContext, useContext, useState, useCallback } from 'react';
// import { CourseBasicInfo } from '../types/Course';

export type WarningType = 'duplicate' | 'prerequisite' | 'not_for_taken';

interface Warning {
  courseId: string;
  type: WarningType;
  message: string;
}

interface WarningContextType {
  warnings: Warning[];
  addWarning: (warning: Warning) => void;
  removeWarning: (courseId: string, type: WarningType) => void;
  getWarningsForCourse: (courseId: string) => Warning[];
  clearWarnings: () => void;
}

const WarningContext = createContext<WarningContextType | undefined>(undefined);

export function WarningProvider({ children }: { children: React.ReactNode }) {
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const addWarning = useCallback((warning: Warning) => {
    setWarnings(prev => {
      // Check if warning already exists
      const exists = prev.some(w => 
        w.courseId === warning.courseId && w.type === warning.type
      );
      if (exists) return prev;
      return [...prev, warning];
    });
  }, []);

  const removeWarning = useCallback((courseId: string, type: WarningType) => {
    setWarnings(prev => 
      prev.filter(w => !(w.courseId === courseId && w.type === type))
    );
  }, []);

  const getWarningsForCourse = useCallback((courseId: string) => {
    return warnings.filter(w => w.courseId === courseId);
  }, [warnings]);

  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  return (
    <WarningContext.Provider value={{
      warnings,
      addWarning,
      removeWarning,
      getWarningsForCourse,
      clearWarnings,
    }}>
      {children}
    </WarningContext.Provider>
  );
}

export function useWarnings() {
  const context = useContext(WarningContext);
  if (context === undefined) {
    throw new Error('useWarnings must be used within a WarningProvider');
  }
  return context;
} 