import { describe, expect, it } from 'vitest';
import { createWebPreferencesAdapter } from './preferences-adapter';

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: function (key: string): string | null {
      if (store.has(key)) {
        return store.get(key) as string;
      }
      return null;
    },
    setItem: function (key: string, value: string): void {
      store.set(key, value);
    },
  };
}

describe('createWebPreferencesAdapter', function () {
  it('loads defaults when storage is empty', function () {
    const localStorage = createMemoryStorage();
    (globalThis as Record<string, unknown>).window = { localStorage: localStorage };

    const adapter = createWebPreferencesAdapter();
    const loaded = adapter.loadPreferences();
    expect(loaded.showPathAdvisorPanel).toBe(true);
    expect(loaded.showSensitiveData).toBe(true);
    expect(loaded.pathAdvisorExpanded).toBe(false);
  });

  it('saves and reloads preferences', function () {
    const localStorage = createMemoryStorage();
    (globalThis as Record<string, unknown>).window = { localStorage: localStorage };

    const adapter = createWebPreferencesAdapter();
    adapter.savePreferences({
      showPathAdvisorPanel: false,
      showSensitiveData: false,
      pathAdvisorExpanded: true,
    });

    const loaded = adapter.loadPreferences();
    expect(loaded.showPathAdvisorPanel).toBe(false);
    expect(loaded.showSensitiveData).toBe(false);
    expect(loaded.pathAdvisorExpanded).toBe(true);
  });
});
