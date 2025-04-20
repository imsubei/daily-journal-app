'use client';

import { AuthProvider } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider } from './contexts/SettingsContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <JournalProvider>
        <TaskProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </TaskProvider>
      </JournalProvider>
    </AuthProvider>
  );
}
