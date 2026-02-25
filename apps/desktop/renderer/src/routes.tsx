import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell, CareerScreen, DashboardScreen, PreferencesProvider, SettingsScreen } from '@pathos/ui-web';
import { DesktopShellAdapterProvider } from './desktop-shell-adapter-provider';
import { createDesktopPreferencesAdapter } from './adapters/preferences-adapter';

const desktopPreferencesAdapter = createDesktopPreferencesAdapter();

function DesktopRouteView() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/career" element={<CareerScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function DesktopRouter() {
  return (
    <BrowserRouter>
      <PreferencesProvider adapter={desktopPreferencesAdapter}>
        <DesktopShellAdapterProvider>
          <AppShell>
            <DesktopRouteView />
          </AppShell>
        </DesktopShellAdapterProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}
