import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Preferences } from '@pathos/core';
import { defaultPreferences } from '@pathos/core';
import { PreferencesProvider } from '../preferences/PreferencesProvider';
import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', function () {
  it('calls savePreferences when toggles change', function () {
    const savedValues: Preferences[] = [];
    const adapter = {
      loadPreferences: function () {
        return defaultPreferences;
      },
      savePreferences: function (preferences: Preferences) {
        savedValues.push(preferences);
      },
    };

    render(
      <PreferencesProvider adapter={adapter}>
        <SettingsScreen />
      </PreferencesProvider>
    );

    const toggle = screen.getByLabelText('Show PathAdvisor panel') as HTMLInputElement;
    fireEvent.click(toggle);

    expect(savedValues.length).toBe(1);
    expect(savedValues[0].showPathAdvisorPanel).toBe(false);
  });
});
