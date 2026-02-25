'use client';

import type { Preferences } from '@pathos/core';
import { usePreferencesController } from '../preferences/PreferencesProvider';
import { SectionCard } from './components/SectionCard';
import { SectionHeader } from './components/SectionHeader';

export function SettingsScreen() {
  const controller = usePreferencesController();
  const preferences = controller.preferences;

  const setPreference = function (key: keyof Preferences, value: boolean) {
    const nextPreferences = Object.assign({}, preferences);
    nextPreferences[key] = value;
    controller.savePreferences(nextPreferences);
  };

  return (
    <div className="shared-screen">
      <SectionHeader title="Settings" subtitle="Cross-platform preferences for PathOS." />
      <div className="shared-screen-grid">
        <SectionCard title="Display">
          <label className="shared-toggle-row">
            <input
              type="checkbox"
              checked={preferences.showPathAdvisorPanel}
              onChange={function (event) {
                setPreference('showPathAdvisorPanel', event.target.checked);
              }}
            />
            <span>Show PathAdvisor panel</span>
          </label>
          <label className="shared-toggle-row">
            <input
              type="checkbox"
              checked={preferences.showSensitiveData}
              onChange={function (event) {
                setPreference('showSensitiveData', event.target.checked);
              }}
            />
            <span>Show sensitive data</span>
          </label>
        </SectionCard>
        <SectionCard title="Workspace">
          <label className="shared-toggle-row">
            <input
              type="checkbox"
              checked={preferences.pathAdvisorExpanded}
              onChange={function (event) {
                setPreference('pathAdvisorExpanded', event.target.checked);
              }}
            />
            <span>Start with PathAdvisor expanded</span>
          </label>
        </SectionCard>
      </div>
    </div>
  );
}
