'use client';

import type React from 'react';
import { createContext, useContext } from 'react';
import type { AppShellAdapterValue } from './types';

const AppShellAdapterContext = createContext<AppShellAdapterValue | null>(null);

interface AppShellAdapterProviderProps {
  value: AppShellAdapterValue;
  children: React.ReactNode;
}

export function AppShellAdapterProvider(props: AppShellAdapterProviderProps) {
  const value = props.value;
  const children = props.children;

  return <AppShellAdapterContext.Provider value={value}>{children}</AppShellAdapterContext.Provider>;
}

export function useAppShellAdapter(): AppShellAdapterValue {
  const context = useContext(AppShellAdapterContext);
  if (context === null) {
    throw new Error('AppShell requires AppShellAdapterProvider in the tree.');
  }
  return context;
}
