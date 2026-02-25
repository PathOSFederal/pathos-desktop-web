export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type { PreferencesAdapter } from './preferences';
export type { NavigationAdapter } from './navigation';
