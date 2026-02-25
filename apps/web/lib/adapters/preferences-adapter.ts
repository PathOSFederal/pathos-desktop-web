import type { PreferencesAdapter } from '@pathos/adapters';
import type { Preferences } from '@pathos/core';
import { defaultPreferences } from '@pathos/core';

const WEB_PREFERENCES_KEY = 'pathos.web.preferences.v1';

export function createWebPreferencesAdapter(): PreferencesAdapter {
  return {
    loadPreferences: function (): Preferences {
      if (typeof window === 'undefined') {
        return defaultPreferences;
      }
      const rawValue = window.localStorage.getItem(WEB_PREFERENCES_KEY);
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
      if (typeof window === 'undefined') {
        return;
      }
      const payload = JSON.stringify(preferences);
      window.localStorage.setItem(WEB_PREFERENCES_KEY, payload);
    },
  };
}

export { WEB_PREFERENCES_KEY };
