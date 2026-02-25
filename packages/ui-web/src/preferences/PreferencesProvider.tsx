'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { PreferencesAdapter } from '@pathos/adapters';
import type { Preferences } from '@pathos/core';
import { defaultPreferences } from '@pathos/core';

interface PreferencesContextValue {
  preferences: Preferences;
  savePreferences: (nextPreferences: Preferences) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface PreferencesProviderProps {
  adapter: PreferencesAdapter;
  children: React.ReactNode;
}

export function PreferencesProvider(props: PreferencesProviderProps) {
  const adapter = props.adapter;
  const children = props.children;
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(
    function loadPreferences() {
      const loaded = adapter.loadPreferences();
      setPreferences(loaded);
    },
    [adapter]
  );

  const savePreferences = function (nextPreferences: Preferences) {
    setPreferences(nextPreferences);
    adapter.savePreferences(nextPreferences);
  };

  const value: PreferencesContextValue = {
    preferences: preferences,
    savePreferences: savePreferences,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferencesController(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === null) {
    throw new Error('usePreferencesController requires PreferencesProvider.');
  }
  return context;
}
