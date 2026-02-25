import type { PreferencesAdapter } from '@pathos/adapters';
import type { Preferences } from '@pathos/core';
import { defaultPreferences } from '@pathos/core';

const DESKTOP_PREFERENCES_KEY = 'pathos.desktop.preferences.v1';

export function createDesktopPreferencesAdapter(): PreferencesAdapter {
  return {
    loadPreferences: function (): Preferences {
      const rawValue = window.localStorage.getItem(DESKTOP_PREFERENCES_KEY);
      if (rawValue === null) {
        return defaultPreferences;
      }
      try {
        const parsed = JSON.parse(rawValue) as Record<string, unknown>;
        const nextPreferences: Preferences = Object.assign({}, defaultPreferences);
        if (parsed.showPathAdvisorPanel === false) {
          nextPreferences.showPathAdvisorPanel = false;
        }
        if (parsed.showSensitiveData === false) {
          nextPreferences.showSensitiveData = false;
        }
        if (parsed.pathAdvisorExpanded === true) {
          nextPreferences.pathAdvisorExpanded = true;
        }
        return nextPreferences;
      } catch (_error) {
        return defaultPreferences;
      }
    },
    savePreferences: function (preferences: Preferences): void {
      const payload = JSON.stringify(preferences);
      window.localStorage.setItem(DESKTOP_PREFERENCES_KEY, payload);
    },
  };
}

export { DESKTOP_PREFERENCES_KEY };
