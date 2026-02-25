import type { Preferences } from '@pathos/core';

export interface PreferencesAdapter {
  loadPreferences(): Preferences;
  savePreferences(preferences: Preferences): void;
}
